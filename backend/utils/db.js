const mysql2=require('mysql2')

const pool=mysql2.createPool({
    host:'localhost',
    user:'root',
    password:'pass123',
    database:'School_Management_db'
})

module.exports=pool