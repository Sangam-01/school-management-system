import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import api from '../../api/axios'
import { AuthContext } from '../../auth/AuthContext'

const AddStudent = () => {
  const { academicYear } = useContext(AuthContext)

  const [classes, setClasses] = useState([])
  const [form, setForm] = useState({
    reg_no: '',
    fname: '',
    gender: '',
    class_id: '',
    roll_no: '',
    admission_date: '',
  })

  useEffect(() => {
    if (!academicYear) return

    api
      .get(`/admin/classes/${academicYear.academic_year_id}`)
      .then(res => {
        if (res.data.status === 'success') {
          setClasses(res.data.data)
        }
      })
  }, [academicYear])

  const save = () => {
    if (!academicYear) {
      alert('Select academic year first')
      return
    }

    api.post('/admin/student/add', {
      ...form,
      academic_year_id: academicYear.academic_year_id,
    }).then(res => alert(res.data.data))
  }

  return (
    <Box>
      <Typography variant="h5">Add Student</Typography>

      {!academicYear && (
        <Typography color="error">
          Please select academic year
        </Typography>
      )}

      <Card sx={{ maxWidth: 500, mt: 2 }}>
        <CardContent>
          <TextField
            label="Registration No"
            fullWidth
            margin="normal"
            onChange={e =>
              setForm({ ...form, reg_no: e.target.value })
            }
          />

          <TextField
            label="First Name"
            fullWidth
            margin="normal"
            onChange={e =>
              setForm({ ...form, fname: e.target.value })
            }
          />

          <Select
            fullWidth
            displayEmpty
            value={form.gender}
            onChange={e =>
              setForm({ ...form, gender: e.target.value })
            }
            sx={{ mt: 2 }}
          >
            <MenuItem value="">Select Gender</MenuItem>
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </Select>

          <Select
            fullWidth
            displayEmpty
            value={form.class_id}
            onChange={e =>
              setForm({ ...form, class_id: e.target.value })
            }
            sx={{ mt: 2 }}
            disabled={!academicYear}
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
            onChange={e =>
              setForm({ ...form, roll_no: e.target.value })
            }
          />

          <TextField
            type="date"
            label="Admission Date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            onChange={e =>
              setForm({
                ...form,
                admission_date: e.target.value,
              })
            }
          />

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={save}
            disabled={!academicYear}
          >
            Save Student
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}

export default AddStudent
