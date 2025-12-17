const express=require('express')
const bcrypt=require('bcrypt')

const pool=require('../utils/db')
const result=require('../utils/result')


const router=express.Router()

// const SaltRounds=10
// router.post('/Principalsignin', (req, res) => {
//     const { username, password } = req.body

//     const sql = `SELECT * FROM users WHERE username = ? AND role='principal'`

//     pool.query(sql, [username], (err, data) => {
//         if (err)
//             res.send(result.createResult(err))

//         else if (data.length === 0)
//              res.send(result.createResult("Invalid Username"))
            

//         else {
        
//             bcrypt.compare(password, data[0].password, (err, passwordStatus) => {
//                 if (passwordStatus) {
//                     const user = {
//                             user_id: data[0].user_id,
//                             username: data[0].username,
//                             role: data[0].role,
//                             status: data[0].status
//                     }
//                     res.send(result.createResult(null, user))
//                 }
//                 else
//                     res.send(result.createResult('Invalid Password'))
//             })
//         }
//     })
// })


router.get('/getAll',(req,res)=>{
    const sql="SELECT * FROM employee where role='principal'    "
    pool.query(sql,(err,data)=>{
        res.send(result.createResult(err,data))
    })

})


// router.post('/PrincipalReg', (req, res) => {
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

router.get('/teachers', (req, res) => { //view teachers
    const sql = `
        SELECT 
            e.employee_id,
            e.fname,
            e.lname,
            e.mobile,
            e.email,
            e.gender,
            e.joining_date,
            e.salary,
            u.status,
            u.user_id
        FROM employee e
        JOIN users u ON e.user_id = u.user_id
        WHERE e.role = 'teacher'
    `

    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data))
    })
})

router.get('/students', (req, res) => { //view students
    const sql = `
        SELECT 
            s.student_id,
            s.roll_no,
            s.reg_no,
            s.fname,
            s.lname,
            s.gender,
            s.mobile,
            s.email,
            c.class_name,
            c.section,
            u.status,
            u.user_id
        FROM student s
        JOIN users u ON s.user_id = u.user_id
        LEFT JOIN class c ON s.class_id = c.class_id
    `

    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data))
    })
})

router.get('/teacher/:id/students', (req, res) => {  //need class id given by admin (so class teacher can define) 
    const sql = `           
        SELECT 
            s.student_id,
            s.roll_no,
            s.fname,
            s.lname,
            c.class_name,
            c.section
        FROM student s
        JOIN class c ON s.class_id = c.class_id
        JOIN subject sub ON sub.class_id = c.class_id
        WHERE sub.teacher_id = ?
        GROUP BY s.student_id
    `

    pool.query(sql, [req.params.id], (err, data) => {  //Teacher-wise Student List
        res.send(result.createResult(err, data))
    })
})

router.get('/students/classcount', (req, res) => {  // as class_id null add by admin
    const sql = `
        SELECT 
            c.class_name,
            c.section,
            COUNT(s.student_id) AS total_students
        FROM class c
        LEFT JOIN student s ON c.class_id = s.class_id
        GROUP BY c.class_id
    `

    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data))
    })
})

router.get('/accounts/fees', (req, res) => {  //view all acc (fees details)
    const sql = `
        SELECT 
            f.fee_id,
            s.reg_no,
            CONCAT(s.fname,' ',s.lname) AS student_name,
            fc.category_name,
            f.amount,
            f.month,
            f.payment_date,
            f.status
        FROM fees f
        JOIN student s ON f.student_id = s.student_id
        JOIN fee_category fc ON f.category_id = fc.category_id
        ORDER BY f.payment_date DESC
    `

    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data))
    })
})

router.get('/dashboard/accounts', (req, res) => {  //Account symm
    const sql = `
        SELECT 
            status,
            SUM(amount) AS total_amount
        FROM fees
        GROUP BY status
    `

    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data))
    })
})


module.exports=router