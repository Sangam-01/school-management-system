import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { AuthContext } from '../../auth/AuthContext'

const statusLabel = {
  active: 'Active',
  inactive: 'Inactive',
  promoted: 'Promoted',
  passed: 'Passed Out',
  left: 'Left',
}

const Students = () => {
  const { academicYear } = useContext(AuthContext)
  const navigate = useNavigate()

  const [students, setStudents] = useState([])
  const [classes, setClasses] = useState([])
  const [openEdit, setOpenEdit] = useState(false)

  const [form, setForm] = useState({
    enrollment_id: null,
    class_id: '',
    roll_no: '',
  })

  /* =========================
     LOAD DATA
  ========================= */
  const loadData = async () => {
    if (!academicYear?.academic_year_id) return

    try {
      const [studentsRes, classesRes] = await Promise.all([
        api.get(`/admin/students/${academicYear.academic_year_id}`),
        api.get(`/admin/classes/${academicYear.academic_year_id}`),
      ])

      // students API (standard createResult)
      if (studentsRes.data.status === 'success') {
        setStudents(studentsRes.data.data)
      }

      // classes API (custom { status, data })
      const classPayload = classesRes.data.data || classesRes.data
      setClasses(classPayload || [])
    } catch (err) {
      console.error('Failed to load students/classes', err)
    }
  }

  useEffect(() => {
    loadData()
  }, [academicYear])

  /* =========================
     EDIT STUDENT
  ========================= */
  const openEditDialog = student => {
    setForm({
      enrollment_id: student.enrollment_id,
      class_id: student.class_id,
      roll_no: student.roll_no,
    })
    setOpenEdit(true)
  }

  const saveEdit = async () => {
    if (!form.enrollment_id || !form.class_id || !form.roll_no) return

    await api.put('/admin/student/change-class-roll', {
      enrollment_id: form.enrollment_id,
      class_id: form.class_id,
      roll_no: Number(form.roll_no),
    })

    setOpenEdit(false)
    loadData()
  }

  /* =========================
     TOGGLE STATUS
  ========================= */
  const toggleStatus = async enrollment_id => {
    await api.put('/admin/student/toggle-status', { enrollment_id })
    loadData()
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Students — {academicYear?.year_name}
      </Typography>

      <Button
        variant="contained"
        sx={{ mb: 2 }}
        onClick={() => navigate('/students/add')}
      >
        Add Student
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Reg No</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Class</TableCell>
            <TableCell>Roll</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {students.map(s => (
            <TableRow key={s.enrollment_id} hover>
              <TableCell>{s.reg_no}</TableCell>
              <TableCell>{s.name}</TableCell>
              <TableCell>
                {s.class_level}-{s.division}
              </TableCell>
              <TableCell>{s.roll_no}</TableCell>
              <TableCell>{statusLabel[s.status] || s.status}</TableCell>
              <TableCell>
                <Button size="small" onClick={() => openEditDialog(s)}>
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => toggleStatus(s.enrollment_id)}
                >
                  Toggle Status
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ================= EDIT DIALOG ================= */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Student</DialogTitle>

        <DialogContent>
          <Select
            fullWidth
            sx={{ mt: 2 }}
            value={form.class_id}
            onChange={e =>
              setForm({ ...form, class_id: e.target.value })
            }
          >
            <MenuItem value="">Select Class</MenuItem>
            {classes.map(c => (
              <MenuItem key={c.class_id} value={c.class_id}>
                {c.class_level}-{c.division}
              </MenuItem>
            ))}
          </Select>

          <TextField
            label="Roll No"
            type="number"
            fullWidth
            margin="normal"
            value={form.roll_no}
            onChange={e =>
              setForm({ ...form, roll_no: e.target.value })
            }
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveEdit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Students
