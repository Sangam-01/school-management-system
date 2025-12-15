const express=require('express')
const bcrypt=require('bcrypt')
const pool=require('../utils/db')
const result=require('../utils/result')


const router=express.Router()

const SaltRounds=10
router.post('/Studentsignin', (req, res) => {
    const { username, password } = req.body

    const sql = `SELECT * FROM users WHERE username = ? AND role='student'`

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
    const sql="SELECT * FROM student "
    pool.query(sql,(err,data)=>{
        res.send(result.createResult(err,data))
    })

})

router.post('/StudentReg', (req, res) => {
    const { roll_no, reg_no, fname} = req.body

    const { username, password ,role} = req.body 

    const sql1 = 'INSERT INTO users (username, password ,role)values(?,?,?)'
    const sql2 = 'INSERT INTO student (user_id,roll_no, reg_no, fname)values(?,?,?,?)'

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

            pool.query(sql2, [user_id, roll_no, reg_no, fname], (err, studentResult) => {
                res.send(result.createResult(err, studentResult))
            })
        })
    }})


    
})

//strted fro here 

// --- 1. Student Attendance APIs ---

// GET /students/:student_id/attendance - Get full or filtered attendance
app.get('/students/:student_id/attendance', async (req, res) => {
    const { student_id } = req.params;
    const { month, year } = req.query;

    let sql = 'SELECT * FROM attendance_student WHERE student_id = ?';
    let params = [student_id];

    if (month && year) {
        // Filter by month and year
        sql += ' AND YEAR(date) = ? AND MONTHNAME(date) = ?';
        params.push(year, month);
    }

    try {
        const [rows] = await db.query(sql, params);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching attendance data.');
    }
});

// POST /attendance/students - Mark attendance (Admin/Teacher only)
app.post('/attendance/students', authorizeTeacherOrAdmin, async (req, res) => {
    const { student_id, date, status } = req.body; // e.g., [{ student_id: 1, date: '2025-12-16', status: 'Present' }]
    
    // Simple validation for a single record
    if (!student_id || !date || !status) {
        return res.status(400).send('Missing required fields: student_id, date, or status.');
    }

    const sql = 'INSERT INTO attendance_student (student_id, date, status) VALUES (?, ?, ?)';
    
    try {
        const [result] = await db.query(sql, [student_id, date, status]);
        res.status(201).json({ message: 'Attendance recorded successfully', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error recording attendance.');
    }
});

// PUT /attendance/students/:attendance_id - Update attendance (Admin/Teacher only)
app.put('/attendance/students/:attendance_id', authorizeTeacherOrAdmin, async (req, res) => {
    const { attendance_id } = req.params;
    const { status } = req.body;

    if (!status) {
        return res.status(400).send('Missing required field: status.');
    }

    const sql = 'UPDATE attendance_student SET status = ? WHERE attendance_id = ?';
    
    try {
        const [result] = await db.query(sql, [status, attendance_id]);
        if (result.affectedRows === 0) {
            return res.status(404).send('Attendance record not found.');
        }
        res.status(200).json({ message: 'Attendance updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating attendance.');
    }
});


// --- 2. Student Marks & Exam APIs ---

// GET /students/:student_id/marks - Get full marksheet
app.get('/students/:student_id/marks', async (req, res) => {
    const { student_id } = req.params;
    
    const sql = `
        SELECT 
            m.marks_obtained, m.max_marks, m.grade,
            s.subject_name,
            c.class_name, c.section
        FROM marks m
        JOIN subject s ON m.subject_id = s.subject_id
        JOIN class c ON s.class_id = c.class_id
        WHERE m.student_id = ?
        ORDER BY s.subject_name;
    `;

    try {
        const [rows] = await db.query(sql, [student_id]);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching student marks.');
    }
});

// POST /marks - Add marks (Admin/Teacher only)
app.post('/marks', authorizeTeacherOrAdmin, async (req, res) => {
    const { student_id, subject_id, marks_obtained, max_marks, grade } = req.body;
    
    if (!student_id || !subject_id || marks_obtained === undefined || max_marks === undefined) {
        return res.status(400).send('Missing required fields.');
    }

    const sql = 'INSERT INTO marks (student_id, subject_id, marks_obtained, max_marks, grade) VALUES (?, ?, ?, ?, ?)';
    
    try {
        const [result] = await db.query(sql, [student_id, subject_id, marks_obtained, max_marks, grade]);
        res.status(201).json({ message: 'Marks recorded successfully', id: result.insertId });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error recording marks.');
    }
});

// --- 3. File Upload APIs ---

// POST /students/:student_id/upload/image - Upload student image
app.post('/students/:student_id/upload/image', authorizeTeacherOrAdmin, upload.single('profile_image'), async (req, res) => {
    const { student_id } = req.params;

    if (!req.file) {
        return res.status(400).send('No file uploaded or file type is invalid.');
    }

    const imagePath = req.file.filename; // The filename generated by multer
    
    const sql = 'UPDATE student SET image = ? WHERE student_id = ?';
    
    try {
        const [result] = await db.query(sql, [imagePath, student_id]);
        
        if (result.affectedRows === 0) {
            // Delete the uploaded file if student ID is invalid
            fs.unlinkSync(req.file.path); 
            return res.status(404).send('Student not found. Image upload failed.');
        }

        res.status(200).json({ 
            message: 'Profile image updated successfully', 
            image_path: `/uploads/${imagePath}`
        });

    } catch (err) {
        console.error(err);
        fs.unlinkSync(req.file.path); // Cleanup on database error
        res.status(500).send('Database error updating image path.');
    }
});

// PATCH /students/:student_id/profile - Update contact info
router.patch('/:student_id/profile', authorizeStudent, async (req, res) => {
    const { student_id } = req.params;
    const { email, address, mobile } = req.body;
    
    // Only update fields that are provided
    const updateFields = [];
    const updateValues = [];

    if (email) {
        updateFields.push('email = ?');
        updateValues.push(email);
    }
    if (address) {
        updateFields.push('address = ?');
        updateValues.push(address);
    }
    if (mobile) {
        updateFields.push('mobile = ?');
        updateValues.push(mobile);
    }

    if (updateFields.length === 0) {
        return res.status(400).send('No valid fields provided for update.');
    }

    const sql = `UPDATE student SET ${updateFields.join(', ')} WHERE student_id = ?`;
    updateValues.push(student_id);

    try {
        const [result] = await db.query(sql, updateValues);
        if (result.affectedRows === 0) {
            return res.status(404).send('Student not found or no changes made.');
        }
        res.status(200).json({ message: 'Profile contact information updated successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error updating profile.');
    }
});

// PUT /students/:student_id/change-password - Change password specific to student
router.put('/:student_id/change-password', authorizeStudent, async (req, res) => {
    const { student_id } = req.params;
    const { old_password, new_password } = req.body; 

    if (!old_password || !new_password) {
        return res.status(400).send('Missing old_password or new_password.');
    }

    try {
        // 1. Get the user_id associated with the student_id
        const [studentRows] = await db.query('SELECT user_id FROM student WHERE student_id = ?', [student_id]);
        if (studentRows.length === 0) {
            return res.status(404).send('Student not found.');
        }
        const user_id = studentRows[0].user_id;

        // 2. Fetch current password hash from users table
        const [userRows] = await db.query('SELECT password FROM users WHERE user_id = ?', [user_id]);
        const currentHashedPassword = userRows[0].password;

        // 3. Verify old password (***CRITICAL: Use bcrypt.compare in a real app***)
        // MOCK CHECK: For this simple demo, we assume the stored password is plain text
        if (old_password !== currentHashedPassword) { 
            return res.status(401).send('Incorrect old password.');
        }

        // 4. Hash new password (***CRITICAL: Use bcrypt.hash in a real app***)
        const newHashedPassword = new_password; // In production, hash this!

        // 5. Update password in users table
        await db.query('UPDATE users SET password = ? WHERE user_id = ?', [newHashedPassword, user_id]);

        res.status(200).json({ message: 'Password updated successfully.' });

    } catch (err) {
        console.error(err);
        res.status(500).send('Error changing password.');
    }
});

// GET /students/:student_id/assignments - View assigned homework/assignments
router.get('/:student_id/assignments', authorizeStudent, async (req, res) => {
    const { student_id } = req.params;

    // This query finds all assignments posted for the student's current subjects
    const sql = `
        SELECT 
            asn.title, asn.description, asn.due_date,
            sub.subject_name,
            e.fname AS teacher_fname, e.lname AS teacher_lname
        FROM student std
        JOIN subject sub ON std.class_id = sub.class_id
        JOIN assignments asn ON sub.subject_id = asn.subject_id
        JOIN employee e ON asn.posted_by_teacher_id = e.employee_id
        WHERE std.student_id = ?
        ORDER BY asn.due_date ASC;
    `;

    try {
        const [rows] = await db.query(sql, [student_id]);
        res.status(200).json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching assignments.');
    }
});

// GET /students/:student_id/materials - Access study materials
router.get('/:student_id/materials', authorizeStudent, async (req, res) => {
    const { student_id } = req.params;

    // This query finds all study materials posted for the student's current subjects
    const sql = `
        SELECT 
            mat.title, mat.file_path, mat.upload_date,
            sub.subject_name
        FROM student std
        JOIN subject sub ON std.class_id = sub.class_id
        JOIN study_materials mat ON sub.subject_id = mat.subject_id
        WHERE std.student_id = ?
        ORDER BY sub.subject_name, mat.upload_date DESC;
    `;

    try {
        const [rows] = await db.query(sql, [student_id]);
        
        // NOTE: In a real app, file_path would be used to stream or redirect to the file storage (e.g., S3 or /uploads)
        const materialsWithFullPath = rows.map(item => ({
             ...item,
             download_url: `/uploads/materials/${item.file_path}` // Construct a downloadable URL
        }));

        res.status(200).json(materialsWithFullPath);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching study materials.');
    }
});


// POST /students/:student_id/leave-request - Submit a leave request
router.post('/:student_id/leave-request', authorizeStudent, async (req, res) => {
    const { student_id } = req.params;
    const { start_date, end_date, reason } = req.body;

    // You must create the 'leave_requests' table first!
    if (!start_date || !end_date || !reason) {
        return res.status(400).send('Missing start_date, end_date, or reason.');
    }
    
    // Status is 'Pending' by default in the new table
    const sql = `
        INSERT INTO leave_requests (student_id, start_date, end_date, reason, submission_date, status)
        VALUES (?, ?, ?, ?, NOW(), 'Pending');
    `;
    
    try {
        const [result] = await db.query(sql, [student_id, start_date, end_date, reason]);
        res.status(201).json({ 
            message: 'Leave request submitted successfully. Status: Pending review.', 
            request_id: result.insertId 
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Error submitting leave request. Ensure the leave_requests table exists.');
    }
});



module.exports=router
