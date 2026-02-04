const express = require('express')
const pool = require('../utils/db')
const result = require('../utils/result')

const router = express.Router()

/* =========================
   STUDENT ONLY GUARD
========================= */
function studentOnly(req, res) {
    if (req.user.role !== 'student') {
        res.send(result.createResult('Access denied: Student only'))
        return false
    }
    return true
}

/* =====================================================
   1. GET OWN PROFILE
===================================================== */
router.get('/profile', (req, res) => {
    if (!studentOnly(req, res)) return

    const sql = `
        SELECT 
            s.student_id,
            s.roll_no,
            s.reg_no,
            s.fname,
            s.lname,
            s.gender,
            s.email,
            s.mobile,
            s.address,
            c.class_name,
            c.section
        FROM students s
        JOIN classes c ON s.class_id = c.class_id
        WHERE s.user_id = ?
    `
    pool.query(sql, [req.user.user_id], (err, data) => {
        res.send(result.createResult(err, data[0]))
    })
})

/* =====================================================
   2. GET MY CLASS DETAILS
===================================================== */
router.get('/class', (req, res) => {
    if (!studentOnly(req, res)) return

    const sql = `
        SELECT 
            c.class_name,
            c.section,
            CONCAT(e.fname,' ',e.lname) AS class_teacher
        FROM students s
        JOIN classes c ON s.class_id = c.class_id
        LEFT JOIN employees e ON c.class_teacher_id = e.employee_id
        WHERE s.user_id = ?
    `
    pool.query(sql, [req.user.user_id], (err, data) => {
        res.send(result.createResult(err, data[0]))
    })
})

/* =====================================================
   3. GET MY SUBJECTS
===================================================== */
router.get('/subjects', (req, res) => {
    if (!studentOnly(req, res)) return

    const sql = `
        SELECT 
            sub.subject_name,
            CONCAT(e.fname,' ',e.lname) AS teacher_name
        FROM students s
        JOIN subjects sub ON s.class_id = sub.class_id
        JOIN employees e ON sub.teacher_id = e.employee_id
        WHERE s.user_id = ?
    `
    pool.query(sql, [req.user.user_id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   4. GET MY ATTENDANCE
===================================================== */
router.get('/attendance', (req, res) => {
    if (!studentOnly(req, res)) return

    const sql = `
        SELECT attendance_date, status
        FROM attendance_students
        WHERE student_id = (
            SELECT student_id FROM students WHERE user_id=?
        )
        ORDER BY attendance_date DESC
    `
    pool.query(sql, [req.user.user_id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   5. GET MY MARKS
===================================================== */
router.get('/marks', (req, res) => {
    if (!studentOnly(req, res)) return

    const sql = `
        SELECT 
            sub.subject_name,
            m.marks_obtained,
            m.max_marks,
            m.grade
        FROM marks m
        JOIN subjects sub ON m.subject_id = sub.subject_id
        WHERE m.student_id = (
            SELECT student_id FROM students WHERE user_id=?
        )
    `
    pool.query(sql, [req.user.user_id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   6. GET MY FEES
===================================================== */
router.get('/fees', (req, res) => {
    if (!studentOnly(req, res)) return

    const sql = `
        SELECT 
            fc.category_name,
            f.amount,
            f.fee_month,
            f.fee_year,
            f.status,
            f.payment_date
        FROM fees f
        JOIN fee_categories fc ON f.category_id = fc.category_id
        WHERE f.student_id = (
            SELECT student_id FROM students WHERE user_id=?
        )
        ORDER BY f.fee_year DESC, f.fee_month DESC
    `
    pool.query(sql, [req.user.user_id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   7. UPDATE CONTACT INFO
===================================================== */
router.put('/profile/update', (req, res) => {
    if (!studentOnly(req, res)) return

    const { email, mobile, address } = req.body

    const sql = `
        UPDATE students
        SET email=?, mobile=?, address=?
        WHERE user_id=?
    `
    pool.query(
        sql,
        [email, mobile, address, req.user.user_id],
        (err, data) => {
            res.send(result.createResult(err, data))
        }
    )
})

router.get('/academics/class-rank', (req, res) => {
    if (!studentOnly(req, res)) return

    const sql = `
        SELECT 
            student_id,
            AVG(marks_obtained) AS avg_marks
        FROM marks
        WHERE student_id IN (
            SELECT student_id FROM students 
            WHERE class_id = (
                SELECT class_id FROM students WHERE user_id=?
            )
        )
        GROUP BY student_id
        ORDER BY avg_marks DESC
    `
    pool.query(sql, [req.user.user_id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})
router.get('/dashboard/summary', (req, res) => {
    if (!studentOnly(req, res)) return

    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM attendance_students 
             WHERE status='Present' AND student_id=s.student_id) AS present_days,
            (SELECT COUNT(*) FROM marks WHERE student_id=s.student_id) AS exams_given,
            (SELECT COUNT(*) FROM fees WHERE status='Pending' AND student_id=s.student_id) AS pending_fees
        FROM students s
        WHERE s.user_id=?
    `
    pool.query(sql, [req.user.user_id], (err, data) => {
        res.send(result.createResult(err, data[0]))
    })
})


module.exports = router
