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
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useContext, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/axios'
import { AuthContext } from '../../auth/AuthContext'

const ClassProfile = () => {
  const { class_id } = useParams()
  const { academicYears } = useContext(AuthContext)

  /* =========================
     STATE
  ========================= */
  const [tab, setTab] = useState(0)
  const [profile, setProfile] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [students, setStudents] = useState([])
  const [subjects, setSubjects] = useState([])

  const [openPromote, setOpenPromote] = useState(false)
  const [targetClass, setTargetClass] = useState('')
  const [targetClasses, setTargetClasses] = useState([])

  const [newSubject, setNewSubject] = useState({
    subject_name: '',
    teacher_id: '',
  })

  /* =========================
     LOAD BASE DATA
  ========================= */
  useEffect(() => {
    api.get(`/admin/class/profile/${class_id}`).then(res => {
      if (res.data.status === 'success') setProfile(res.data.data)
    })

    api.get('/admin/teachers').then(res => {
      if (res.data.status === 'success') setTeachers(res.data.data)
    })

    api.get(`/admin/students/by-class/${class_id}`).then(res => {
      if (res.data.status === 'success') setStudents(res.data.data)
    })

    api.get(`/admin/class/${class_id}/subjects`).then(res => {
      if (res.data.status === 'success') setSubjects(res.data.data)
    })
  }, [class_id])

  /* =========================
     DERIVED VALUES (SAFE)
  ========================= */
  const currentLevel = Number(profile?.class_level || 0)
  const isLastClass = currentLevel >= 10

  const currentYear = useMemo(() => {
    if (!profile) return null
    return academicYears.find(
      y => y.academic_year_id === profile.academic_year_id
    )
  }, [academicYears, profile])

  const nextAcademicYear = useMemo(() => {
    if (!currentYear) return null

    return academicYears
      .filter(
        y =>
          new Date(y.start_date) >
          new Date(currentYear.start_date)
      )
      .sort(
        (a, b) =>
          new Date(a.start_date) -
          new Date(b.start_date)
      )[0] || null
  }, [academicYears, currentYear])

  /* =========================
     LOAD NEXT YEAR CLASSES
  ========================= */
  useEffect(() => {
    if (!nextAcademicYear || !profile) return

    api
      .get(`/admin/classes/${nextAcademicYear.academic_year_id}`)
      .then(res => {
        if (res.data.status === 'success') {
          const nextLevel = String(currentLevel + 1)
          setTargetClasses(
            res.data.data.filter(
              c => c.class_level === nextLevel
            )
          )
        }
      })
  }, [nextAcademicYear, profile, currentLevel])

  /* =========================
     ACTIONS
  ========================= */
  const assignClassTeacher = teacher_id => {
    api
      .put('/admin/class/assign-teacher', {
        class_id,
        teacher_id,
      })
      .then(() =>
        api
          .get(`/admin/class/profile/${class_id}`)
          .then(r => setProfile(r.data.data))
      )
  }

  const addSubject = () => {
    if (!newSubject.subject_name || !newSubject.teacher_id) {
      alert('Fill all fields')
      return
    }

    api
      .post('/admin/subject/add', {
        subject_name: newSubject.subject_name,
        class_id,
        teacher_id: newSubject.teacher_id,
        academic_year_id: profile.academic_year_id,
      })
      .then(() => {
        setNewSubject({ subject_name: '', teacher_id: '' })
        return api.get(`/admin/class/${class_id}/subjects`)
      })
      .then(r => setSubjects(r.data.data))
  }

  const promoteClass = () => {
    if (!nextAcademicYear || !targetClass) return

    api
      .post('/admin/students/promote', {
        from_academic_year_id: profile.academic_year_id,
        to_academic_year_id:
          nextAcademicYear.academic_year_id,
        from_class_id: class_id,
        to_class_id: targetClass,
      })
      .then(res => {
        alert(res.data.data)
        setOpenPromote(false)
      })
  }

  /* =========================
     GUARD
  ========================= */
  if (!profile) {
    return <Typography>Loading...</Typography>
  }

  /* =========================
     UI
  ========================= */
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Class Profile
      </Typography>

      <Tabs value={tab} onChange={(e, v) => setTab(v)}>
        <Tab label="Overview" />
        <Tab label="Students" />
        <Tab label="Subjects" />
        <Tab label="Promote" />
      </Tabs>

      {/* OVERVIEW */}
      {tab === 0 && (
        <Card sx={{ maxWidth: 600, mt: 2 }}>
          <CardContent>
            <Typography>
              Class: {profile.class_level}-{profile.division}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Total Students: {profile.total_students}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Class Teacher:{' '}
              {profile.class_teacher || 'Not Assigned'}
            </Typography>

            <Select
              fullWidth
              sx={{ mt: 2 }}
              value={profile.class_teacher_id || ''}
              onChange={e =>
                assignClassTeacher(e.target.value)
              }
            >
              <MenuItem value="">Not Assigned</MenuItem>
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
      )}

      {/* STUDENTS */}
      {tab === 1 && (
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Roll</TableCell>
              <TableCell>Reg No</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {students.map(s => (
              <TableRow key={s.enrollment_id}>
                <TableCell>{s.roll_no}</TableCell>
                <TableCell>{s.reg_no}</TableCell>
                <TableCell>{s.name}</TableCell>
                <TableCell>{s.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* SUBJECTS */}
      {tab === 2 && (
        <Box sx={{ mt: 2 }}>
          <Card sx={{ maxWidth: 500, mb: 3 }}>
            <CardContent>
              <TextField
                label="Subject Name"
                fullWidth
                margin="normal"
                value={newSubject.subject_name}
                onChange={e =>
                  setNewSubject({
                    ...newSubject,
                    subject_name: e.target.value,
                  })
                }
              />

              <Select
                fullWidth
                value={newSubject.teacher_id}
                onChange={e =>
                  setNewSubject({
                    ...newSubject,
                    teacher_id: e.target.value,
                  })
                }
              >
                <MenuItem value="">Select Teacher</MenuItem>
                {teachers.map(t => (
                  <MenuItem
                    key={t.employee_id}
                    value={t.employee_id}
                  >
                    {t.fname} {t.lname}
                  </MenuItem>
                ))}
              </Select>

              <Button
                sx={{ mt: 2 }}
                variant="contained"
                onClick={addSubject}
              >
                Add Subject
              </Button>
            </CardContent>
          </Card>

          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Subject</TableCell>
                <TableCell>Teacher</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {subjects.map(s => (
                <TableRow key={s.subject_id}>
                  <TableCell>{s.subject_name}</TableCell>
                  <TableCell>{s.teacher}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* PROMOTE */}
      {tab === 3 && (
        <Box sx={{ mt: 2 }}>
          {isLastClass ? (
            <Typography color="error">
              Final class — students must be marked Passed.
            </Typography>
          ) : !nextAcademicYear ? (
            <Typography color="error">
              No next academic year available.
            </Typography>
          ) : targetClasses.length === 0 ? (
            <Typography color="error">
              Create Class {currentLevel + 1} in{' '}
              {nextAcademicYear.year_name}
            </Typography>
          ) : (
            <Button
              variant="contained"
              color="warning"
              onClick={() => setOpenPromote(true)}
            >
              Promote to Class {currentLevel + 1}
            </Button>
          )}

          <Dialog
            open={openPromote}
            onClose={() => setOpenPromote(false)}
          >
            <DialogTitle>Confirm Promotion</DialogTitle>
            <DialogContent>
              <Select
                fullWidth
                value={targetClass}
                onChange={e =>
                  setTargetClass(e.target.value)
                }
              >
                {targetClasses.map(c => (
                  <MenuItem
                    key={c.class_id}
                    value={c.class_id}
                  >
                    {c.class_level}-{c.division}
                  </MenuItem>
                ))}
              </Select>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => setOpenPromote(false)}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={promoteClass}
              >
                Promote
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Box>
  )
}

export default ClassProfile
