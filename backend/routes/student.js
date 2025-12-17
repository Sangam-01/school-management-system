const express=require('express')
const bcrypt=require('bcrypt')
const pool=require('../utils/db')
const result=require('../utils/result')


const router=express.Router()

// const SaltRounds=10
// router.post('/Studentsignin', (req, res) => {
//     const { username, password } = req.body

//     const sql = `SELECT * FROM users WHERE username = ? AND role='student'`

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
    const sql="SELECT * FROM student "
    pool.query(sql,(err,data)=>{
        res.send(result.createResult(err,data))
    })

})

router.post('/StudentReg', (req, res) => {
    const { roll_no, reg_no, fname,} = req.body

    const { username, password ,role,admission_date} = req.body 

    const sql1 = 'INSERT INTO users (username, password ,role)values(?,?,?)'
    const sql2 = 'INSERT INTO student (user_id,roll_no, reg_no, fname,admission_date)values(?,?,?,?,?)'

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

            pool.query(sql2, [user_id, roll_no, reg_no, fname,admission_date], (err, studentResult) => {
                res.send(result.createResult(err, studentResult))
            })
        })
    }})
    
})



router.post('/Update', (req, res) => {
    const { class_id, teacher_id} = req.body

    const sql2 = 'update student set teacher_id=? where class_id= ?'

            pool.query(sql2, [ teacher_id,class_id], (err, studentResult) => {
                res.send(result.createResult(err, studentResult))
            })
        })
    






module.exports=router
