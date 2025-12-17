const express=require('express')
const bcrypt=require('bcrypt')

const pool=require('../utils/db')
const result=require('../utils/result')


const router=express.Router()

const SaltRounds=10
router.post('/signin', (req, res) => {
    const { username, password } = req.body

    const sql = `SELECT * FROM users WHERE username = ? AND role='principal'`

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


router.get('/getAll',(req,res)=>{
    const sql="SELECT * FROM employee where role='principal'"
    pool.query(sql,(err,data)=>{
        res.send(result.createResult(err,data))
    })

})




router.post('/PrincipalReg', (req, res) => {
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



module.exports=router