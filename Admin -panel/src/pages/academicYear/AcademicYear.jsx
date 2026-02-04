import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Chip,
} from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import api from '../../api/axios'
import { AuthContext } from '../../auth/AuthContext'
import { formatDate } from '../../utils/formatDate'

const AcademicYear = () => {
  const { reloadAcademicYears, academicYear } =
    useContext(AuthContext)

  const [years, setYears] = useState([])
  const [form, setForm] = useState({
    year_name: '',
    start_date: '',
    end_date: '',
  })

  /* =========================
     LOAD YEARS
  ========================= */
  const loadYears = () => {
    api.get('/admin/academic-years').then(res => {
      if (res.data.status === 'success') {
        setYears(res.data.data)
      }
    })
  }

  useEffect(() => {
    loadYears()
  }, [])

  /* =========================
     CREATE YEAR
  ========================= */
  const createYear = () => {
    if (!form.year_name || !form.start_date || !form.end_date) {
      alert('All fields are required')
      return
    }

    api.post('/admin/academic-year', form).then(res => {
      if (res.data.status === 'success') {
        alert('Academic year created')

        setForm({
          year_name: '',
          start_date: '',
          end_date: '',
        })

        reloadAcademicYears() // 🔥 CRITICAL: update Topbar
        loadYears()
      } else {
        alert(res.data.error || 'Failed')
      }
    })
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Academic Years
      </Typography>

      {/* ================= CREATE FORM ================= */}
      <Card sx={{ maxWidth: 420 }}>
        <CardContent>
          <TextField
            label="Year Name (e.g. 2024-25)"
            fullWidth
            margin="normal"
            value={form.year_name}
            onChange={e =>
              setForm({ ...form, year_name: e.target.value })
            }
          />

          <TextField
            type="date"
            label="Start Date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={form.start_date}
            onChange={e =>
              setForm({ ...form, start_date: e.target.value })
            }
          />

          <TextField
            type="date"
            label="End Date"
            fullWidth
            margin="normal"
            InputLabelProps={{ shrink: true }}
            value={form.end_date}
            onChange={e =>
              setForm({ ...form, end_date: e.target.value })
            }
          />

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={createYear}
          >
            Create Academic Year
          </Button>
        </CardContent>
      </Card>

      {/* ================= LIST ================= */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Existing Academic Years
        </Typography>

        {years.map(y => (
          <Box
            key={y.academic_year_id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 1,
            }}
          >
            <Typography>
              {y.year_name} (
              {formatDate(y.start_date)} →{' '}
              {formatDate(y.end_date)})
            </Typography>

            {academicYear?.academic_year_id ===
              y.academic_year_id && (
              <Chip
                size="small"
                color="success"
                label="Current"
              />
            )}

            {y.is_closed && (
              <Chip
                size="small"
                color="warning"
                label="Closed"
              />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default AcademicYear
