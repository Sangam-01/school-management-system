const express=require('express')

const pool=require('../utils/db')
const result=require('../utils/result')


const router=express.Router()



router.post('/Add',(req,res)=>{
       const { subject_name, class_id ,teacher_id} = req.body 
    
    const sql="insert into  subject (subject_name,class_id,teacher_id) values (?,?,?) "
    pool.query(sql,[subject_name, class_id ,teacher_id],(err,data)=>{
        res.send(result.createResult(err,data))
    })

})


router.get('/getAll',(req,res)=>{
    const sql="SELECT * FROM subject "
    pool.query(sql,(err,data)=>{
        res.send(result.createResult(err,data))
    })

})

router.post('/Update', (req, res) => {
    const {teacher_id , subject_id } = req.body

    const sql2 = 'update subject set teacher_id=? where subject_id =?'

            pool.query(sql2, [teacher_id, subject_id ], (err, studentResult) => {
                res.send(result.createResult(err, studentResult))
            })
        })



module.exports=router