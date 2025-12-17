const express = require('express')
const bcrypt = require('bcrypt')
const pool = require('../utils/db')
const result = require('../utils/result')

const router = express.Router()

const SaltRounds=10

router.post('/registration', (req, res) => {
    const {fname} = req.body

    const { username, password ,role} = req.body 

    const sql1 = 'INSERT INTO users (username, password ,role)values(?,?,?)'
    const sql2 = 'INSERT INTO employee (user_id,fname,role)values(?,?,?)'

    bcrypt.hash(password, SaltRounds, (err, hashedPassword) => {
        if (hashedPassword) {
           if (err) {
            return res.send(result.createResult(err))
        }

        pool.query(sql1, [username, hashedPassword, role], (err, userResult) => {
            if (err) {
                return res.send(result.createResult(err))
            }

            const user_id = userResult.insertId

            pool.query(sql2, [user_id,fname,role], (err, studentResult) => {
                res.send(result.createResult(err, studentResult))
            })
        })
    }})
    
})

router.post('/signin', (req, res) => {
    const { username, password, role } = req.body

    const sql = `SELECT * FROM users WHERE username = ? AND role= ?`

    pool.query(sql, [username,role], (err, data) => {
        if (err)
            res.send(result.createResult(err))

        else if (data.length === 0)
             res.send(result.createResult("Invalid Username"))
            

        else {
        
            bcrypt.compare(password, data[0].password, (err, passwordStatus) => {
                if (passwordStatus) {
                    const user = {
                            user_id: data[0].user_id,
                            username: data[0].username,
                            role: data[0].role,
                            status: data[0].status
                    }
                    res.send(result.createResult(null, user))
                }
                else
                    res.send(result.createResult('Invalid Password'))
            })
        }
    })
})

module.exports = router
