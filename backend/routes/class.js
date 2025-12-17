const express=require('express')
const bcrypt = require('bcrypt')

const pool=require('../utils/db')
const result=require('../utils/result')



const router=express.Router()
 
router.post('/Addclass',(req,res) => {
    const{class_name,section,class_teacher_id}=req.body
    
    const sql = `INSERT INTO class(class_name,section,class_teacher_id) VALUES (?,?,?)` //pass teacher id from frontend this is just for testting
    pool.query(sql,[class_name,section,class_teacher_id],(err,data)=>{

        
        res.send(result.createResult(err,data))

    })

    router.get('/getAll',(req,res)=>{
    const sql="SELECT * FROM class "
    pool.query(sql,(err,data)=>{
        res.send(result.createResult(err,data))
    })

})


})

router.post('/Update', (req, res) => {
    const {class_teacher_id , class_id } = req.body

    const sql2 = 'update class set class_teacher_id=? where class_id =?'

            pool.query(sql2, [class_teacher_id,class_id], (err, studentResult) => {
                res.send(result.createResult(err, studentResult))
            })
        })



module.exports = router
