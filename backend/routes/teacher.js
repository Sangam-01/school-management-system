const express = require('express')
const pool = require('../utils/db')
const result = require('../utils/result')

const router = express.Router()

/* =========================
   TEACHER ONLY GUARD
========================= */
function teacherOnly(req, res) {
    if (req.user.role !== 'teacher') {
        res.send(result.createResult('Access denied: Teacher only'))
        return false
    }
    return true
}

/* =====================================================
   1. GET MY PROFILE
===================================================== */
router.get('/profile', (req, res) => {
    if (!teacherOnly(req, res)) return

    const sql = `
        SELECT 
            e.employee_id,
            e.fname,
            e.lname,
            e.email,
            e.mobile,
            e.gender,
            e.joining_date
        FROM employees e
        WHERE e.user_id=?
    `
    pool.query(sql, [req.user.user_id], (err, data) => {
        res.send(result.createResult(err, data[0]))
    })
})

/* =====================================================
   2. GET MY CLASSES
===================================================== */
router.get('/classes', (req, res) => {
    if (!teacherOnly(req, res)) return

    const sql = `
        SELECT class_id, class_name, section
        FROM classes
        WHERE class_teacher_id = (
            SELECT employee_id FROM employees WHERE user_id=?
        )
    `
    pool.query(sql, [req.user.user_id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   3. GET MY SUBJECTS
===================================================== */
router.get('/subjects', (req, res) => {
    if (!teacherOnly(req, res)) return

    const sql = `
        SELECT 
            sub.subject_id,
            sub.subject_name,
            c.class_name,
            c.section
        FROM subjects sub
        JOIN classes c ON sub.class_id=c.class_id
        WHERE sub.teacher_id = (
            SELECT employee_id FROM employees WHERE user_id=?
        )
    `
    pool.query(sql, [req.user.user_id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   4. GET STUDENTS OF A CLASS
===================================================== */
router.get('/class/:class_id/students', (req, res) => {
    if (!teacherOnly(req, res)) return

    const sql = `
        SELECT student_id, roll_no, fname, lname
        FROM students
        WHERE class_id=?
        ORDER BY roll_no
    `
    pool.query(sql, [req.params.class_id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   5. MARK STUDENT ATTENDANCE
===================================================== */
router.post('/attendance/mark', (req, res) => {
    if (!teacherOnly(req, res)) return

    const { student_id, attendance_date, status } = req.body

    const sql = `
        INSERT INTO attendance_students
        (student_id, attendance_date, status)
        VALUES (?,?,?)
    `
    pool.query(sql, [student_id, attendance_date, status], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   6. UPDATE ATTENDANCE
===================================================== */
router.put('/attendance/update', (req, res) => {
    if (!teacherOnly(req, res)) return

    const { attendance_id, status } = req.body

    pool.query(
        'UPDATE attendance_students SET status=? WHERE attendance_id=?',
        [status, attendance_id],
        (err, data) => res.send(result.createResult(err, data))
    )
})

/* =====================================================
   7. ATTENDANCE SUMMARY (CLASS)
===================================================== */
router.get('/attendance/class/:class_id', (req, res) => {
    if (!teacherOnly(req, res)) return

    const sql = `
        SELECT s.student_id,
               CONCAT(s.fname,' ',s.lname) AS student_name,
               COUNT(a.attendance_id) AS total_days,
               SUM(a.status='Present') AS present_days
        FROM students s
        LEFT JOIN attendance_students a ON s.student_id=a.student_id
        WHERE s.class_id=?
        GROUP BY s.student_id
    `
    pool.query(sql, [req.params.class_id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   8. ADD MARKS
===================================================== */
router.post('/marks/add', (req, res) => {
    if (!teacherOnly(req, res)) return

    const { student_id, subject_id, marks_obtained, max_marks, grade } = req.body

    const sql = `
        INSERT INTO marks
        (student_id, subject_id, marks_obtained, max_marks, grade)
        VALUES (?,?,?,?,?)
    `
    pool.query(sql,
        [student_id, subject_id, marks_obtained, max_marks, grade],
        (err, data) => res.send(result.createResult(err, data))
    )
})

/* =====================================================
   9. UPDATE MARKS
===================================================== */
router.put('/marks/update', (req, res) => {
    if (!teacherOnly(req, res)) return

    const { mark_id, marks_obtained, grade } = req.body

    pool.query(
        'UPDATE marks SET marks_obtained=?, grade=? WHERE mark_id=?',
        [marks_obtained, grade, mark_id],
        (err, data) => res.send(result.createResult(err, data))
    )
})

/* =====================================================
   10. VIEW MARKS (CLASS + SUBJECT)
===================================================== */
router.get('/marks/class/:class_id/subject/:subject_id', (req, res) => {
    if (!teacherOnly(req, res)) return

    const sql = `
        SELECT s.roll_no, s.fname, s.lname,
               m.marks_obtained, m.grade
        FROM students s
        LEFT JOIN marks m
            ON s.student_id=m.student_id
            AND m.subject_id=?
        WHERE s.class_id=?
        ORDER BY s.roll_no
    `
    pool.query(sql,
        [req.params.subject_id, req.params.class_id],
        (err, data) => res.send(result.createResult(err, data))
    )
})

/* =====================================================
   11. CLASS PERFORMANCE SUMMARY
===================================================== */
router.get('/analytics/class/:class_id', (req, res) => {
    if (!teacherOnly(req, res)) return

    const sql = `
        SELECT 
            AVG(m.marks_obtained) AS avg_marks
        FROM marks m
        JOIN students s ON m.student_id=s.student_id
        WHERE s.class_id=?
    `
    pool.query(sql, [req.params.class_id], (err, data) => {
        res.send(result.createResult(err, data[0]))
    })
})

/* =====================================================
   12. TOP STUDENTS (CLASS)
===================================================== */
router.get('/analytics/top/:class_id', (req, res) => {
    if (!teacherOnly(req, res)) return

    const sql = `
        SELECT 
            s.student_id,
            CONCAT(s.fname,' ',s.lname) AS student_name,
            AVG(m.marks_obtained) AS avg_marks
        FROM marks m
        JOIN students s ON m.student_id=s.student_id
        WHERE s.class_id=?
        GROUP BY s.student_id
        ORDER BY avg_marks DESC
        LIMIT 5
    `
    pool.query(sql, [req.params.class_id], (err, data) => {
        res.send(result.createResult(err, data))
    })
})

/* =====================================================
   13. SUBJECT PERFORMANCE
===================================================== */
router.get('/analytics/subject/:subject_id', (req, res) => {
    if (!teacherOnly(req, res)) return

    pool.query(
        'SELECT AVG(marks_obtained) AS avg_marks FROM marks WHERE subject_id=?',
        [req.params.subject_id],
        (err, data) => res.send(result.createResult(err, data[0]))
    )
})

/* =====================================================
   14. STUDENT ATTENDANCE DETAIL
===================================================== */
router.get('/attendance/student/:student_id', (req, res) => {
    if (!teacherOnly(req, res)) return

    pool.query(
        'SELECT attendance_date, status FROM attendance_students WHERE student_id=?',
        [req.params.student_id],
        (err, data) => res.send(result.createResult(err, data))
    )
})

/* =====================================================
   15. DASHBOARD SUMMARY
===================================================== */
router.get('/dashboard/summary', (req, res) => {
    if (!teacherOnly(req, res)) return

    const sql = `
        SELECT
            (SELECT COUNT(*) FROM subjects WHERE teacher_id =
                (SELECT employee_id FROM employees WHERE user_id=?)
            ) AS total_subjects,
            (SELECT COUNT(*) FROM classes WHERE class_teacher_id =
                (SELECT employee_id FROM employees WHERE user_id=?)
            ) AS total_classes
    `
    pool.query(sql, [req.user.user_id, req.user.user_id], (err, data) => {
        res.send(result.createResult(err, data[0]))
    })
})

module.exports = router
