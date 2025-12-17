const express=require('express')
const bcrypt=require('bcrypt')
const pool=require('../utils/db')
const result=require('../utils/result')


const router=express.Router()

// const SaltRounds=10
// router.post('/Teachersignin', (req, res) => {
//     const { username, password } = req.body

//     const sql = `SELECT * FROM users WHERE username = ? AND role='teacher'`

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
    const sql="SELECT * FROM employee where role='teacher'"
    pool.query(sql,(err,data)=>{
        res.send(result.createResult(err,data))
    })

})

// router.post('/TeacherReg', (req, res) => {
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



router.post('/ProfileUpdate', (req, res) => {
    const { mname, lname, mother_name} = req.body

    const { email, address ,dob,class_id,gender,mobile} = req.body 
const {employee_id} = req.header
    const sql1 = 'INSERT INTO users (username, password ,role)values(?,?,?)'
    const sql2 = 'update set  employee mname=? ,lname=?, address=?, gender=?,mobile=?,email=? where employee_id=?'

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

            pool.query(sql2, [user_id, roll_no, reg_no, fname], (err, studentResult) => {
                res.send(result.createResult(err, studentResult))
            })
        })
    }})
    
})





router.post('/marks', (req, res) => {
  const { student_id, subject_id, marks_obtained, max_marks, grade } = req.body

  const sql = `
    INSERT INTO marks 
    (student_id, subject_id, marks_obtained, max_marks, grade)
    VALUES (?,?,?,?,?)`

  pool.query(sql,
    [student_id, subject_id, marks_obtained, max_marks, grade],
    (err, data) => {
      res.send(result.createResult(err, data))
    }
  )
})



// teacher.js
router.post('/attendance/student', (req, res) => {
  const { student_id, date, status } = req.body

  const sql = `
    INSERT INTO attendance_student (student_id, date, status)
    VALUES (?,?,?)`

  pool.query(sql, [student_id, date, status], (err, data) => {
    res.send(result.createResult(err, data))
  })
})





// attendance.js OR student.js
router.get('/attendance/summary/:student_id', (req, res) => {
  const { student_id } = req.params

  const sql = `
    SELECT
      COUNT(*) AS total_days,
      SUM(status IN ('Present','Late')) AS present_days,
      ROUND(
        (SUM(status IN ('Present','Late')) / COUNT(*)) * 100,
        2
      ) AS attendance_percentage
    FROM attendance_student
    WHERE student_id = ?`

  pool.query(sql, [student_id], (err, data) => {
    res.send(result.createResult(err, data[0]))
  })
})





module.exports=router
