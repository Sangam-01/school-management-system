const mysql2=require('mysql2')

const pool=mysql2.createPool({
    host:'localhost',
    user:'Sangam_7',
    password:'manager',
    database:'school_Management_db'
})

module.exports=pool