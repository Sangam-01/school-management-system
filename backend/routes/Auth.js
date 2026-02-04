const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const pool = require('../utils/db')
const result = require('../utils/result')

const router = express.Router()
const SALT_ROUNDS = 10

/* =========================
   REGISTRATION (ADMIN USE)
========================= */
router.post('/registration', (req, res) => {
    const { fname, username, password, role } = req.body

    if (!username || !password || !role) {
        return res.send(result.createResult('Missing required fields'))
    }

    const sqlUser = `
        INSERT INTO users (username, password, role)
        VALUES (?, ?, ?)
    `
    const sqlEmployee = `
        INSERT INTO employee (user_id, fname, role)
        VALUES (?, ?, ?)
    `

    bcrypt.hash(password, SALT_ROUNDS, (err, hashedPassword) => {
        if (err) {
            return res.send(result.createResult(err))
        }

        pool.query(sqlUser, [username, hashedPassword, role], (err, userData) => {
            if (err) {
                return res.send(result.createResult(err))
            }

            const user_id = userData.insertId

            pool.query(sqlEmployee, [user_id, fname, role], (err, empData) => {
                res.send(result.createResult(err, empData))
            })
        })
    })
})

/* =========================
   SINGLE LOGIN (ALL ROLES)
========================= */
router.post('/signin', (req, res) => {
    const { username, password } = req.body

    const sql = `
        SELECT user_id, username, password, role, status
        FROM users
        WHERE username = ? AND status='active'
    `

    pool.query(sql, [username], (err, data) => {
        if (err || data.length == 0) {
            console.log(data)
            console.log( username)
            console.log('Invalid username')
            return res.send(result.createResult('Invalid credentials'))
        }

        bcrypt.compare(password, data[0].password, (err, isMatch) => {
            if (!isMatch) {
                return res.send(result.createResult('Invalid credentials'))
            }

            const payload = {
                user_id: data[0].user_id,
                role: data[0].role
            }

            const token = jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: '1d' }
            )

            res.send(
                result.createResult(null, {
                    token,
                    role: data[0].role
                })
            )
        })
    })
})

module.exports = router
