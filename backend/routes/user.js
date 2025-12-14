const express=require('express')
const bcrypt = require('bcrypt')

const pool=require('../utils/db')
const result=require('../utils/result')



const router=express.Router()
 
const SaltRounds=10
router.post('/signin', (req, res) => {
    const { username, password } = req.body

    const sql = `SELECT * FROM users WHERE username = ? AND role='student'`

    pool.query(sql, [username], (err, data) => {
        if (err)
            res.send(result.createResult(err))

        else if (data.length === 0)
             res.send(result.createResult("Invalid Username"))
            

        else {
        
            bcrypt.compare(password, data[0].password, (err, passwordStatus) => {
                if (passwordStatus) {
                    const user = {
                        uid: data[0].uid,
                        name: data[0].name,
                        email: data[0].email,
                        mobile: data[0].mobile
                    }
                    res.send(result.createResult(null, user))
                }
                else
                    res.send(result.createResult('Invalid Password'))
            })
        }
    })
})



router.post('/signup', (req, res) => {
    const { username, password } = req.body

    const sql = `INSERT INTO users(username, password, role) VALUES (?,?, 'student')`

    bcrypt.hash(password, SaltRounds, (err, hashedPassword) => {
        if (hashedPassword) {
            pool.query(sql, [username, hashedPassword], (err, data) => {
                res.send(result.createResult(err, data))
            })
        } else {
            res.send(result.createResult(err))
        }
    })
})


router.get('/', (req, res) => {
    const sql = `SELECT * FROM users WHERE role='teacher'`
    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data))
    })
})

module.exports = router
