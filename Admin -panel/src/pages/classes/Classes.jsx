import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { AuthContext } from '../../auth/AuthContext'

const classLevels = ['1','2','3','4','5','6','7','8','9','10']
const divisions = ['A', 'B', 'C']

const Classes = () => {
  const { academicYear } = useContext(AuthContext)
  const navigate = useNavigate()

  const [classes, setClasses] = useState([])
  const [form, setForm] = useState({
    class_level: '',
    division: '',
  })

  /* =========================
     LOAD CLASSES (SESSION-WISE)
  ========================= */
  const loadClasses = () => {
    if (!academicYear || !academicYear.academic_year_id) return

    api
      .get(`/admin/classes/${academicYear.academic_year_id}`)
      .then(res => {
        if (res.data.status === 'success') {
          setClasses(res.data.data)
        }
      })
  }

  useEffect(() => {
    loadClasses()
  }, [academicYear])

  /* =========================
     ADD CLASS
  ========================= */
  const addClass = () => {
    if (!academicYear) {
      alert('Please select academic year')
      return
    }

    if (!form.class_level || !form.division) {
      alert('Select class and division')
      return
    }

    api
      .post('/admin/class/add', {
        class_level: form.class_level,
        division: form.division,
        academic_year_id: academicYear.academic_year_id,
      })
      .then(res => {
        if (res.data.status === 'success') {
          setForm({ class_level: '', division: '' })
          loadClasses()
        } else {
          alert(res.data.error || 'Failed')
        }
      })
  }

  /* =========================
     UI
  ========================= */
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Classes
      </Typography>

      {!academicYear && (
        <Typography color="error" sx={{ mb: 2 }}>
          Please select academic year from top bar
        </Typography>
      )}

      {/* ADD CLASS */}
      <Card sx={{ maxWidth: 500, mb: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Add Class
          </Typography>

          <Select
            fullWidth
            displayEmpty
            value={form.class_level}
            onChange={e =>
              setForm({ ...form, class_level: e.target.value })
            }
            sx={{ mt: 1 }}
            disabled={!academicYear}
          >
            <MenuItem value="">Select Class</MenuItem>
            {classLevels.map(c => (
              <MenuItem key={c} value={c}>
                Class {c}
              </MenuItem>
            ))}
          </Select>

          <Select
            fullWidth
            displayEmpty
            value={form.division}
            onChange={e =>
              setForm({ ...form, division: e.target.value })
            }
            sx={{ mt: 2 }}
            disabled={!academicYear}
          >
            <MenuItem value="">Select Division</MenuItem>
            {divisions.map(d => (
              <MenuItem key={d} value={d}>
                Division {d}
              </MenuItem>
            ))}
          </Select>

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={addClass}
            disabled={!academicYear}
          >
            Add Class
          </Button>
        </CardContent>
      </Card>

      {/* CLASS LIST */}
      <Grid container spacing={2}>
        {classes.map(c => (
          <Grid item xs={12} md={4} key={c.class_id}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6">
                  Class {c.class_level}-{c.division}
                </Typography>

                <Typography sx={{ mt: 1 }}>
                  Class Teacher:{' '}
                  {c.class_teacher
                    ? c.class_teacher
                    : 'Not Assigned'}
                </Typography>


                <Typography color="text.secondary">
                  Total Students: {c.total_students}
                </Typography>

                <Button
                  size="small"
                  sx={{ mt: 2 }}
                  onClick={() =>
                    navigate(`/classes/${c.class_id}`)
                  }
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {academicYear && classes.length === 0 && (
        <Typography sx={{ mt: 2 }}>
          No classes added yet
        </Typography>
      )}
    </Box>
  )
}

export default Classes
