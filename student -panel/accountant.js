const express = require('express')
const pool = require('../utils/db')
const result = require('../utils/result')

const router = express.Router()

/* =========================
   ACCOUNTANT ONLY GUARD
========================= */
function accountantOnly(req, res) {
    if (req.user.role !== 'accountant') {
        res.send(result.createResult('Access denied: Accountant only'))
        return false
    }
    return true
}

/* =====================================================
   1. GET ACCOUNTANT PROFILE
===================================================== */
router.get('/profile', (req, res) => {
    if (!accountantOnly(req, res)) return

    const sql = `
        SELECT 
            e.employee_id,
            e.fname,
            e.mname,
            e.lname,
            e.gender,
            e.mobile,
            e.email,
            e.address,
            e.image,
            e.reg_no,
            DATE_FORMAT(e.joining_date, '%Y-%m-%d') AS joining_date,
            e.salary,
            u.username,
            u.status
        FROM employees e
        JOIN users u ON e.user_id = u.user_id
        WHERE e.user_id = ?
    `

    pool.query(sql, [req.user.user_id], (err, rows) => {
        if (err) {
            return res.send(result.createResult(err))
        }

        if (rows.length === 0) {
            return res.send(
                result.createResult('Accountant profile not found')
            )
        }

        res.send(result.createResult(null, rows[0]))
    })
})

/* =====================================================
   2. UPDATE ACCOUNTANT PROFILE
===================================================== */
router.put('/profile/update', (req, res) => {
    if (!accountantOnly(req, res)) return

    const {
        fname, mname, lname,
        gender, mobile, address, email
    } = req.body

    const sql = `
        UPDATE employees
        SET
            fname = ?,
            mname = ?,
            lname = ?,
            gender = ?,
            mobile = ?,
            address = ?,
            email = ?
        WHERE user_id = ?
    `

    pool.query(
        sql,
        [fname, mname, lname, gender, mobile, address, email, req.user.user_id],
        (err, data) => {
            if (err) {
                return res.send(result.createResult(err))
            }

            if (data.affectedRows === 0) {
                return res.send(
                    result.createResult('Accountant profile not found')
                )
            }

            res.send(
                result.createResult(null, 'Profile updated successfully')
            )
        }
    )
})

/* =====================================================
   3. UPDATE PROFILE IMAGE
===================================================== */
router.put('/profile/update-image', (req, res) => {
    if (!accountantOnly(req, res)) return

    const { image } = req.body

    if (!image) {
        return res.send(result.createResult('Image path is required'))
    }

    const sql = `
        UPDATE employees
        SET image = ?
        WHERE user_id = ?
    `

    pool.query(sql, [image, req.user.user_id], (err, data) => {
        if (err) {
            return res.send(result.createResult(err))
        }

        if (data.affectedRows === 0) {
            return res.send(result.createResult('Profile not found'))
        }

        res.send(result.createResult(null, 'Profile image updated'))
    })
})

/* =====================================================
   4. DASHBOARD SUMMARY
===================================================== */
router.get('/dashboard', (req, res) => {
    if (!accountantOnly(req, res)) return

    const sql = `
        SELECT
            -- Total students
            (SELECT COUNT(*) FROM students) AS total_students,
            
            -- Total fees collected this month
            (SELECT IFNULL(SUM(amount), 0) 
             FROM fees 
             WHERE status = 'Paid' 
             AND MONTH(payment_date) = MONTH(CURRENT_DATE())
             AND YEAR(payment_date) = YEAR(CURRENT_DATE())
            ) AS monthly_collection,
            
            -- Total pending fees
            (SELECT IFNULL(SUM(amount), 0) 
             FROM fees 
             WHERE status = 'Pending'
            ) AS total_pending,
            
            -- Total overdue fees
            (SELECT IFNULL(SUM(amount), 0) 
             FROM fees 
             WHERE status = 'Overdue'
            ) AS total_overdue,
            
            -- Total fees collected (all time)
            (SELECT IFNULL(SUM(amount), 0) 
             FROM fees 
             WHERE status = 'Paid'
            ) AS total_collected
    `

    pool.query(sql, (err, data) => {
        if (err) {
            return res.send(result.createResult(err))
        }

        res.send(result.createResult(null, data[0]))
    })
})

/* =====================================================
   5. GET ALL FEE CATEGORIES
===================================================== */
router.get('/fee-categories', (req, res) => {
    if (!accountantOnly(req, res)) return

    const sql = `
        SELECT 
            category_id,
            category_name,
            amount
        FROM fee_categories
        ORDER BY category_name
    `

    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   6. ADD FEE CATEGORY
===================================================== */
router.post('/fee-categories/add', (req, res) => {
    if (!accountantOnly(req, res)) return

    const { category_name, amount } = req.body

    if (!category_name || !amount) {
        return res.send(result.createResult('Category name and amount required'))
    }

    const sql = `
        INSERT INTO fee_categories (category_name, amount)
        VALUES (?, ?)
    `

    pool.query(sql, [category_name, amount], (err, data) => {
        if (err) {
            return res.send(result.createResult(err))
        }

        res.send(result.createResult(null, 'Fee category added successfully'))
    })
})

/* =====================================================
   7. UPDATE FEE CATEGORY
===================================================== */
router.put('/fee-categories/:id', (req, res) => {
    if (!accountantOnly(req, res)) return

    const { category_name, amount } = req.body

    const sql = `
        UPDATE fee_categories
        SET category_name = ?, amount = ?
        WHERE category_id = ?
    `

    pool.query(sql, [category_name, amount, req.params.id], (err, data) => {
        if (err) {
            return res.send(result.createResult(err))
        }

        if (data.affectedRows === 0) {
            return res.send(result.createResult('Fee category not found'))
        }

        res.send(result.createResult(null, 'Fee category updated'))
    })
})

/* =====================================================
   8. DELETE FEE CATEGORY
===================================================== */
router.delete('/fee-categories/:id', (req, res) => {
    if (!accountantOnly(req, res)) return

    const sql = `DELETE FROM fee_categories WHERE category_id = ?`

    pool.query(sql, [req.params.id], (err, data) => {
        if (err) {
            return res.send(result.createResult(err))
        }

        res.send(result.createResult(null, 'Fee category deleted'))
    })
})

/* =====================================================
   9. GET ALL STUDENTS WITH FEE STATUS
===================================================== */
router.get('/students/fees', (req, res) => {
    if (!accountantOnly(req, res)) return

    const { class_id, status, month, year } = req.query

    let sql = `
        SELECT DISTINCT
            s.student_id,
            s.reg_no,
            s.roll_no,
            CONCAT(s.fname, ' ', IFNULL(s.lname, '')) AS student_name,
            s.mobile,
            c.class_name,
            c.section,
            
            -- Total pending for this student
            (SELECT IFNULL(SUM(amount), 0)
             FROM fees
             WHERE student_id = s.student_id
             AND status = 'Pending'
            ) AS total_pending,
            
            -- Total paid by this student
            (SELECT IFNULL(SUM(amount), 0)
             FROM fees
             WHERE student_id = s.student_id
             AND status = 'Paid'
            ) AS total_paid
            
        FROM students s
        JOIN classes c ON s.class_id = c.class_id
        WHERE 1=1
    `

    const params = []

    if (class_id) {
        sql += ` AND s.class_id = ?`
        params.push(class_id)
    }

    sql += ` ORDER BY c.class_name, s.roll_no`

    pool.query(sql, params, (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   10. GET STUDENT FEE DETAILS
===================================================== */
router.get('/students/:student_id/fees', (req, res) => {
    if (!accountantOnly(req, res)) return

    const sql = `
        SELECT
            f.fee_id,
            fc.category_name,
            f.amount,
            f.fee_month,
            f.fee_year,
            f.status,
            DATE_FORMAT(f.payment_date, '%Y-%m-%d') AS payment_date,
            f.receipt_no,
            f.created_at
        FROM fees f
        JOIN fee_categories fc ON f.category_id = fc.category_id
        WHERE f.student_id = ?
        ORDER BY f.fee_year DESC, f.fee_month DESC, fc.category_name
    `

    pool.query(sql, [req.params.student_id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   11. ASSIGN FEE TO STUDENT
===================================================== */
router.post('/fees/assign', (req, res) => {
    if (!accountantOnly(req, res)) return

    const { student_id, category_id, amount, fee_month, fee_year } = req.body

    if (!student_id || !category_id || !amount || !fee_month || !fee_year) {
        return res.send(result.createResult('All fields are required'))
    }

    const sql = `
        INSERT INTO fees (student_id, category_id, amount, fee_month, fee_year, status)
        VALUES (?, ?, ?, ?, ?, 'Pending')
    `

    pool.query(sql, [student_id, category_id, amount, fee_month, fee_year], (err, data) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.send(result.createResult('Fee already assigned for this month'))
            }
            return res.send(result.createResult(err))
        }

        res.send(result.createResult(null, 'Fee assigned successfully'))
    })
})

/* =====================================================
   12. COLLECT FEE (MARK AS PAID)
===================================================== */
router.put('/fees/collect/:fee_id', (req, res) => {
    if (!accountantOnly(req, res)) return

    const { payment_date, receipt_no } = req.body

    if (!payment_date) {
        return res.send(result.createResult('Payment date is required'))
    }

    // Generate receipt number if not provided
    const receiptNumber = receipt_no || `RCP${Date.now()}`

    const sql = `
        UPDATE fees
        SET 
            status = 'Paid',
            payment_date = ?,
            receipt_no = ?
        WHERE fee_id = ?
        AND status != 'Paid'
    `

    pool.query(sql, [payment_date, receiptNumber, req.params.fee_id], (err, data) => {
        if (err) {
            return res.send(result.createResult(err))
        }

        if (data.affectedRows === 0) {
            return res.send(result.createResult('Fee not found or already paid'))
        }

        res.send(result.createResult(null, {
            message: 'Fee collected successfully',
            receipt_no: receiptNumber
        }))
    })
})

/* =====================================================
   13. BULK FEE ASSIGNMENT (ASSIGN TO ENTIRE CLASS)
===================================================== */
router.post('/fees/assign-bulk', (req, res) => {
    if (!accountantOnly(req, res)) return

    const { class_id, category_id, amount, fee_month, fee_year } = req.body

    if (!class_id || !category_id || !amount || !fee_month || !fee_year) {
        return res.send(result.createResult('All fields are required'))
    }

    // Get all students in the class
    const getStudentsSql = `SELECT student_id FROM students WHERE class_id = ?`

    pool.query(getStudentsSql, [class_id], (err, students) => {
        if (err) {
            return res.send(result.createResult(err))
        }

        if (students.length === 0) {
            return res.send(result.createResult('No students found in this class'))
        }

        // Prepare bulk insert
        const values = students.map(s => [
            s.student_id,
            category_id,
            amount,
            fee_month,
            fee_year,
            'Pending'
        ])

        const insertSql = `
            INSERT INTO fees (student_id, category_id, amount, fee_month, fee_year, status)
            VALUES ?
            ON DUPLICATE KEY UPDATE amount = VALUES(amount)
        `

        pool.query(insertSql, [values], (err, data) => {
            if (err) {
                return res.send(result.createResult(err))
            }

            res.send(result.createResult(null, `Fee assigned to ${students.length} students`))
        })
    })
})

/* =====================================================
   14. MARK FEES AS OVERDUE
===================================================== */
router.put('/fees/mark-overdue', (req, res) => {
    if (!accountantOnly(req, res)) return

    const sql = `
        UPDATE fees
        SET status = 'Overdue'
        WHERE status = 'Pending'
        AND (
            (fee_year < YEAR(CURRENT_DATE()))
            OR 
            (fee_year = YEAR(CURRENT_DATE()) AND fee_month < MONTH(CURRENT_DATE()))
        )
    `

    pool.query(sql, (err, data) => {
        if (err) {
            return res.send(result.createResult(err))
        }

        res.send(result.createResult(null, `${data.affectedRows} fees marked as overdue`))
    })
})

/* =====================================================
   15. FEE COLLECTION REPORT (MONTHLY)
===================================================== */
router.get('/reports/monthly', (req, res) => {
    if (!accountantOnly(req, res)) return

    const { month, year } = req.query

    if (!month || !year) {
        return res.send(result.createResult('Month and year are required'))
    }

    const sql = `
        SELECT
            fc.category_name,
            COUNT(f.fee_id) AS total_fees,
            SUM(CASE WHEN f.status = 'Paid' THEN 1 ELSE 0 END) AS paid_count,
            SUM(CASE WHEN f.status = 'Pending' THEN 1 ELSE 0 END) AS pending_count,
            SUM(CASE WHEN f.status = 'Overdue' THEN 1 ELSE 0 END) AS overdue_count,
            SUM(CASE WHEN f.status = 'Paid' THEN f.amount ELSE 0 END) AS collected_amount,
            SUM(CASE WHEN f.status != 'Paid' THEN f.amount ELSE 0 END) AS pending_amount
        FROM fees f
        JOIN fee_categories fc ON f.category_id = fc.category_id
        WHERE f.fee_month = ? AND f.fee_year = ?
        GROUP BY fc.category_id
    `

    pool.query(sql, [month, year], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   16. FEE COLLECTION REPORT (DATE RANGE)
===================================================== */
router.get('/reports/date-range', (req, res) => {
    if (!accountantOnly(req, res)) return

    const { start_date, end_date } = req.query

    if (!start_date || !end_date) {
        return res.send(result.createResult('Start date and end date are required'))
    }

    const sql = `
        SELECT
            DATE_FORMAT(f.payment_date, '%Y-%m-%d') AS payment_date,
            COUNT(f.fee_id) AS transactions,
            SUM(f.amount) AS total_collected
        FROM fees f
        WHERE f.status = 'Paid'
        AND f.payment_date BETWEEN ? AND ?
        GROUP BY DATE(f.payment_date)
        ORDER BY f.payment_date DESC
    `

    pool.query(sql, [start_date, end_date], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   17. CLASS-WISE FEE SUMMARY
===================================================== */
router.get('/reports/class-wise', (req, res) => {
    if (!accountantOnly(req, res)) return

    const sql = `
        SELECT
            c.class_name,
            c.section,
            COUNT(DISTINCT s.student_id) AS total_students,
            IFNULL(SUM(CASE WHEN f.status = 'Paid' THEN f.amount ELSE 0 END), 0) AS collected,
            IFNULL(SUM(CASE WHEN f.status = 'Pending' THEN f.amount ELSE 0 END), 0) AS pending,
            IFNULL(SUM(CASE WHEN f.status = 'Overdue' THEN f.amount ELSE 0 END), 0) AS overdue
        FROM classes c
        LEFT JOIN students s ON c.class_id = s.class_id
        LEFT JOIN fees f ON s.student_id = f.student_id
        GROUP BY c.class_id
        ORDER BY c.class_name, c.section
    `

    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   18. DEFAULTERS LIST (STUDENTS WITH PENDING/OVERDUE)
===================================================== */
router.get('/defaulters', (req, res) => {
    if (!accountantOnly(req, res)) return

    const sql = `
        SELECT
            s.student_id,
            s.reg_no,
            s.roll_no,
            CONCAT(s.fname, ' ', IFNULL(s.lname, '')) AS student_name,
            s.mobile,
            c.class_name,
            c.section,
            SUM(CASE WHEN f.status = 'Pending' THEN f.amount ELSE 0 END) AS pending_amount,
            SUM(CASE WHEN f.status = 'Overdue' THEN f.amount ELSE 0 END) AS overdue_amount,
            COUNT(CASE WHEN f.status IN ('Pending', 'Overdue') THEN 1 END) AS pending_count
        FROM students s
        JOIN classes c ON s.class_id = c.class_id
        LEFT JOIN fees f ON s.student_id = f.student_id
        WHERE f.status IN ('Pending', 'Overdue')
        GROUP BY s.student_id
        HAVING pending_count > 0
        ORDER BY overdue_amount DESC, pending_amount DESC
    `

    pool.query(sql, (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   19. RECENT TRANSACTIONS
===================================================== */
router.get('/transactions/recent', (req, res) => {
    if (!accountantOnly(req, res)) return

    const limit = req.query.limit || 10

    const sql = `
        SELECT
            f.fee_id,
            f.receipt_no,
            DATE_FORMAT(f.payment_date, '%Y-%m-%d') AS payment_date,
            f.amount,
            CONCAT(s.fname, ' ', IFNULL(s.lname, '')) AS student_name,
            s.reg_no,
            c.class_name,
            c.section,
            fc.category_name
        FROM fees f
        JOIN students s ON f.student_id = s.student_id
        JOIN classes c ON s.class_id = c.class_id
        JOIN fee_categories fc ON f.category_id = fc.category_id
        WHERE f.status = 'Paid'
        ORDER BY f.payment_date DESC, f.created_at DESC
        LIMIT ?
    `

    pool.query(sql, [parseInt(limit)], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   20. SEARCH STUDENTS FOR FEE ASSIGNMENT
===================================================== */
router.get('/students/search', (req, res) => {
    if (!accountantOnly(req, res)) return

    const { keyword } = req.query

    if (!keyword) {
        return res.send(result.createResult('Search keyword required'))
    }

    const searchTerm = `%${keyword}%`

    const sql = `
        SELECT
            s.student_id,
            s.reg_no,
            s.roll_no,
            CONCAT(s.fname, ' ', IFNULL(s.lname, '')) AS student_name,
            c.class_name,
            c.section
        FROM students s
        JOIN classes c ON s.class_id = c.class_id
        WHERE 
            s.fname LIKE ? OR
            s.lname LIKE ? OR
            s.reg_no LIKE ? OR
            s.roll_no LIKE ?
        LIMIT 20
    `

    pool.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

module.exports = router
