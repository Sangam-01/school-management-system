const bcrypt = require('bcrypt')
const mysql = require('mysql2')

const SALT_ROUNDS = 10

const pool = mysql.createPool({
  host: 'localhost',
  user: 'Sangam_7',
  password: 'manager',
  database: 'school_management_db'
})

const password = 'Admin@123'   // LOGIN PASSWORD

bcrypt.hash(password, SALT_ROUNDS, (err, hash) => {
  if (err) {
    console.error(err)
    return
  }

  const sql = `
    INSERT INTO users (username, password, role)
    VALUES (?, ?, 'admin')
  `

  pool.query(sql, ['admin3', hash], (err, result) => {
    if (err) {
      console.error(err)
    } else {
      console.log('Admin created successfully')
    }
    process.exit()
  })
})
