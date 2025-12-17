const express=require('express')
const bcrypt = require('bcrypt')

const pool=require('../utils/db')
const result=require('../utils/result')
const router = require('./user')

// const SaltRounds=10
// router.post('/AccountantReg', (req, res) => {
//     const {fname} = req.body

//     const { username, password ,role} = req.body 

//     const sql1 = 'INSERT INTO users (username, password ,role)values(?,?,?)'
//     const sql2 = 'INSERT INTO employee (user_id,fname,role)values(?,?,?)'

//     bcrypt.hash(password, SaltRounds, (err, hashedPassword) => {
//         if (hashedPassword) {
//            if (err) {
//             return res.send(result.createResult(err))
//         }

//         pool.query(sql1, [username, hashedPassword, role], (err, userResult) => {
//             if (err) {
//                 return res.send(result.createResult(err))
//             }

//             const user_id = userResult.insertId

//             pool.query(sql2, [user_id,fname,role], (err, studentResult) => {
//                 res.send(result.createResult(err, studentResult))
//             })
//         })
//     }})
// })


    // router.post('/Accountantsignin', (req, res) => {
    //     const { username, password } = req.body

    //     const sql = `SELECT * FROM users WHERE username = ? AND role='accountant'`

    //     pool.query(sql, [username], (err, data) => {
    //         if (err)
    //             res.send(result.createResult(err))

    //         else if (data.length === 0)
    //             res.send(result.createResult("Invalid Username"))
                

    //         else {
            
    //             bcrypt.compare(password, data[0].password, (err, passwordStatus) => {
    //                 if (passwordStatus) {
    //                     const user = {
    //                         user_id: data[0].user_id,
    //                         username: data[0].username,
    //                         role: data[0].role,
    //                         status: data[0].status
    //                     }
    //                     res.send(result.createResult(null, user))
    //                 }
    //                 else
    //                     res.send(result.createResult('Invalid Password'))
    //             })
    //         }
    //     })
    // })

    // router.post('/accountant/fee-category', (req, res) => { 
    //     const { category_name, amount } = req.body
    
    //     const sql = `
    //         INSERT INTO fee_category (category_name, amount)
    //         VALUES (?, ?)
    //     `
    
    //     pool.query(sql, [category_name, amount], (err, data) => {
    //         res.send(result.createResult(err, data))
    //     })
    // })

    router.post('/feecategory', (req, res) => {
        const { category_name, amount } = req.body
    
        const sql = `
            INSERT INTO fee_category (category_name, amount)
            VALUES (?, ?)
        `
    
        pool.query(sql, [category_name, amount], (err, data) => {
            if (err) {
                // MySQL duplicate entry error
                if (err.code === 'ER_DUP_ENTRY') { // ER_DUP_ENTRY == given when there is duplicate entry we checking code on it
                    return res.send(
                        result.createResult("Fee category already exists")
                    )
                }
                return res.send(result.createResult(err))
            }
    
            res.send(result.createResult(null, data))
        })
    })
    
    router.get('/getAllcategory', (req, res) => {
        const sql = `SELECT * FROM fee_category`
    
        pool.query(sql, (err, data) => {
            res.send(result.createResult(err, data))
        })
    })

    router.post('/fees', (req, res) => {  //assignfees
        const { student_id, category_id, amount, month } = req.body
    
        const sql = `
            INSERT INTO fees (student_id, category_id, amount, month)
            VALUES (?, ?, ?, ?)
        `
    
        pool.query(sql, [student_id, category_id, amount, month], (err, data) => {
            res.send(result.createResult(err, data))
        })
    })
    
    router.put('/fees/:id/pay', (req, res) => { //update sttus
        const { receipt_no, payment_date } = req.body
    
        const sql = `
            UPDATE fees
            SET status='Paid',
                receipt_no=?,
                payment_date=?
            WHERE fee_id=?
        `
    
        pool.query(sql, [receipt_no, payment_date, req.params.id], (err, data) => {
            res.send(result.createResult(err, data))
        })
    })

    router.get('/fees/student/:id', (req, res) => {  //getfeesof students
        const sql = `
            SELECT 
                f.fee_id,
                f.month,
                f.amount,
                f.status,
                f.payment_date,
                fc.category_name
            FROM fees f
            JOIN fee_category fc ON f.category_id = fc.category_id
            WHERE f.student_id = ?
            ORDER BY f.month
        `
    
        pool.query(sql, [req.params.id], (err, data) => {
            res.send(result.createResult(err, data))
        })
    })
    
    router.get('/getAllfees', (req, res) => { //Get All Fee Records
        const sql = `
            SELECT 
                f.fee_id,
                s.reg_no,
                CONCAT(s.fname,' ',s.lname) AS student_name,
                fc.category_name,
                f.month,
                f.amount,
                f.status
            FROM fees f
            JOIN student s ON f.student_id = s.student_id
            JOIN fee_category fc ON f.category_id = fc.category_id
            ORDER BY f.month
        `

        pool.query(sql, (err, data) => {
            res.send(result.createResult(err, data))
        })
    })
    
        router.post('/reports/monthly', (req, res) => {  //monthly fees 
            const { month } = req.body
        
            const sql = `
                SELECT 
                    f.month,
                    SUM(f.amount) AS total_collection
                FROM fees f
                WHERE f.status='Paid' AND f.month=?
                GROUP BY f.month
            `
        
            pool.query(sql, [month], (err, data) => {
                res.send(result.createResult(err, data))
            })
        })
        
        router.get('/fees/pending', (req, res) => {  //pending fees
            const sql = `
                SELECT 
                    s.reg_no,
                    CONCAT(s.fname,' ',s.lname) AS student_name,
                    f.month,
                    f.amount
                FROM fees f
                JOIN student s ON f.student_id = s.student_id
                WHERE f.status='Pending'
            `
        
            pool.query(sql, (err, data) => {
                res.send(result.createResult(err, data))
            })
        })
        
    

module.exports = router