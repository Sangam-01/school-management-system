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
import { formatDate } from '../../utils/formatDate'

const classLevels = ['1','2','3','4','5','6','7','8','9','10']

const FeeStructure = () => {
  const { academicYear } = useContext(AuthContext)

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    class_level: '',
    total_amount: '',
  })

  /* =========================
     FETCH FEE STRUCTURE
  ========================= */
  const fetchData = () => {
    if (!academicYear || !academicYear.academic_year_id) return

    setLoading(true)
    api
      .get(`/admin/fees/structure/${academicYear.academic_year_id}`)
      .then(res => {
        if (res.data.status === 'success') {
          setData(res.data.data)
        }
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (academicYear && academicYear.academic_year_id) {
      fetchData()
    }
  }, [academicYear])

  /* =========================
     SAVE / UPDATE STRUCTURE
  ========================= */
  const save = () => {
    // 🔒 HARD GUARD (NO CRASH POSSIBLE)
    if (!academicYear || !academicYear.academic_year_id) {
      alert('Please select an academic year first')
      return
    }

    if (!form.class_level || !form.total_amount) {
      alert('Please fill all fields')
      return
    }

    api
      .post('/admin/fees/structure', {
        class_level: form.class_level,
        total_amount: form.total_amount,
        academic_year_id: academicYear.academic_year_id,
      })
      .then(res => {
        if (res.data.status === 'success') {
          alert('Fee structure saved')
          setForm({ class_level: '', total_amount: '' })
          fetchData()
        } else {
          alert(res.data.error || 'Failed to save')
        }
      })
  }

  /* =========================
     UI
  ========================= */
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Fee Structure
      </Typography>

      {/* WARNING IF YEAR NOT SELECTED */}
      {!academicYear && (
        <Typography color="error" sx={{ mb: 2 }}>
          Please select an academic year from the top bar
        </Typography>
      )}

      {/* ADD / UPDATE FORM */}
      <Card sx={{ maxWidth: 420 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            {academicYear
              ? `Session: ${academicYear.year_name} (${formatDate(
                  academicYear.start_date
                )} → ${formatDate(academicYear.end_date)})`
              : 'No academic year selected'}
          </Typography>

          <Select
            fullWidth
            displayEmpty
            value={form.class_level}
            onChange={e =>
              setForm({ ...form, class_level: e.target.value })
            }
            sx={{ mt: 2 }}
            disabled={!academicYear}
          >
            <MenuItem value="">Select Class</MenuItem>
            {classLevels.map(level => (
              <MenuItem key={level} value={level}>
                Class {level}
              </MenuItem>
            ))}
          </Select>

          <TextField
            label="Total Fee Amount"
            type="number"
            fullWidth
            margin="normal"
            value={form.total_amount}
            onChange={e =>
              setForm({ ...form, total_amount: e.target.value })
            }
            disabled={!academicYear}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 2 }}
            onClick={save}
            disabled={!academicYear || !academicYear.academic_year_id}
          >
            Save Fee Structure
          </Button>
        </CardContent>
      </Card>

      {/* LIST */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Existing Fee Structure
        </Typography>

        {loading && <Typography>Loading...</Typography>}

        {!loading && data.length === 0 && (
          <Typography>No fee structure found</Typography>
        )}

        {!loading &&
          data.map(f => (
            <Card key={f.class_level} sx={{ mb: 1 }}>
              <CardContent
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <Typography>
                  Class {f.class_level}
                </Typography>
                <Typography>
                  ₹ {f.total_amount}
                </Typography>
              </CardContent>
            </Card>
          ))}
      </Box>
    </Box>
  )
}

export default FeeStructure
