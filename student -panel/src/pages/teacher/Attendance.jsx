import { useEffect, useState } from 'react'
import api from '../../api/axios'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  Button,
  Chip
} from '@mui/material'

export default function TeacherAttendance() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)

  // 🔒 FIXED: Today's date only
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    setLoading(true)
    api
      .get(`/teacher/attendance?date=${today}`)
      .then(res => {
        // ensure default status
        const data = res.data.data.map(s => ({
          ...s,
          status: s.status || 'Present'
        }))
        setStudents(data)
      })
      .finally(() => setLoading(false))
  }, [today])

  const handleStatusChange = (id, value) => {
    setStudents(prev =>
      prev.map(s =>
        s.student_id === id ? { ...s, status: value } : s
      )
    )
  }

  const markAttendance = async () => {
    const payload = {
      attendance_date: today,
      students: students.map(s => ({
        student_id: s.student_id,
        status: s.status
      }))
    }

    const res = await api.post('/teacher/attendance/mark', payload)
    alert(res.data.message || 'Attendance Saved')
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h5" fontWeight="bold">
          Mark Attendance
        </Typography>

        <Chip
          label={`Date: ${today}`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {/* TABLE */}
      <TableContainer component={Paper} elevation={3}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell><b>Roll No</b></TableCell>
              <TableCell><b>Student Name</b></TableCell>
              <TableCell align="center"><b>Status</b></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {students.map(s => (
              <TableRow key={s.student_id}>
                <TableCell>{s.roll_no}</TableCell>
                <TableCell>{s.fname}</TableCell>
                <TableCell align="center">
                  <Select
                    size="small"
                    value={s.status}
                    onChange={e =>
                      handleStatusChange(s.student_id, e.target.value)
                    }
                    sx={{ width: 120 }}
                  >
                    <MenuItem value="Present">Present</MenuItem>
                    <MenuItem value="Absent">Absent</MenuItem>
                  </Select>
                </TableCell>
              </TableRow>
            ))}

            {!loading && students.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No students found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* SAVE BUTTON */}
      <Box sx={{ mt: 3, textAlign: 'right' }}>
        <Button
          variant="contained"
          size="large"
          onClick={markAttendance}
          disabled={loading}
        >
          Save Attendance
        </Button>
      </Box>
    </Box>
  )
}
