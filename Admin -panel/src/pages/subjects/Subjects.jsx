import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Select,
    TextField,
    Typography,
  } from '@mui/material'
  import { useContext, useEffect, useState } from 'react'
  import api from '../../api/axios'
  import { AuthContext } from '../../auth/AuthContext'
  
  const Subjects = () => {
    const { academicYear } = useContext(AuthContext)
  
    const [classes, setClasses] = useState([])
    const [teachers, setTeachers] = useState([])
    const [subjects, setSubjects] = useState([])
    const [selectedClass, setSelectedClass] = useState('')
    const [open, setOpen] = useState(false)
  
    const [form, setForm] = useState({
      subject_name: '',
      teacher_id: '',
    })
  
    useEffect(() => {
      if (!academicYear) return
  
      api
        .get(`/admin/classes/${academicYear.academic_year_id}`)
        .then(res => setClasses(res.data.data))
  
      api.get('/admin/teachers').then(res => {
        if (res.data.status === 'success') {
          setTeachers(res.data.data)
        }
      })
    }, [academicYear])
  
    const loadSubjects = classId => {
      setSelectedClass(classId)
      api.get(`/admin/class/${classId}/subjects`).then(res => {
        if (res.data.status === 'success') {
          setSubjects(res.data.data)
        }
      })
    }
  
    const addSubject = () => {
      api
        .post('/admin/subject/add', {
          ...form,
          class_id: selectedClass,
          academic_year_id: academicYear.academic_year_id,
        })
        .then(() => {
          setOpen(false)
          loadSubjects(selectedClass)
        })
    }
  
    const changeTeacher = (subject_id, teacher_id) => {
      api
        .put('/admin/subject/change-teacher', {
          subject_id,
          teacher_id,
        })
        .then(() => loadSubjects(selectedClass))
    }
  
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Subjects — {academicYear?.year_name}
        </Typography>
  
        <Select
          fullWidth
          value={selectedClass}
          onChange={e => loadSubjects(e.target.value)}
          sx={{ mb: 2, maxWidth: 400 }}
        >
          <MenuItem value="">Select Class</MenuItem>
          {classes.map(c => (
            <MenuItem key={c.class_id} value={c.class_id}>
              {c.class_level}-{c.division}
            </MenuItem>
          ))}
        </Select>
  
        {selectedClass && (
          <>
            <Button
              variant="contained"
              sx={{ mb: 2 }}
              onClick={() => setOpen(true)}
            >
              Add Subject
            </Button>
  
            {subjects.map(s => (
              <Card key={s.subject_id} sx={{ mb: 2 }}>
                <CardContent>
                  <Typography variant="h6">
                    {s.subject_name}
                  </Typography>
  
                  <Typography color="text.secondary">
                    Teacher: {s.teacher}
                  </Typography>
  
                  <Select
                    fullWidth
                    size="small"
                    sx={{ mt: 1 }}
                    onChange={e =>
                      changeTeacher(s.subject_id, e.target.value)
                    }
                  >
                    {teachers.map(t => (
                      <MenuItem
                        key={t.employee_id}
                        value={t.employee_id}
                      >
                        {t.fname} {t.lname}
                      </MenuItem>
                    ))}
                  </Select>
                </CardContent>
              </Card>
            ))}
          </>
        )}
  
        {/* ADD SUBJECT MODAL */}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Add Subject</DialogTitle>
          <DialogContent>
            <TextField
              label="Subject Name"
              fullWidth
              margin="normal"
              value={form.subject_name}
              onChange={e =>
                setForm({ ...form, subject_name: e.target.value })
              }
            />
  
            <Select
              fullWidth
              value={form.teacher_id}
              onChange={e =>
                setForm({ ...form, teacher_id: e.target.value })
              }
            >
              <MenuItem value="">Select Teacher</MenuItem>
              {teachers.map(t => (
                <MenuItem key={t.employee_id} value={t.employee_id}>
                  {t.fname} {t.lname}
                </MenuItem>
              ))}
            </Select>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={addSubject}>
              Add
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }
  
  export default Subjects
  