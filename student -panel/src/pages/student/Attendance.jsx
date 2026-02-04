import { useState, useEffect } from 'react'
import { Paper, Typography, Box, Grid, Card, CardContent, TextField, MenuItem } from '@mui/material'
import { EventNote, CheckCircle, Cancel } from '@mui/icons-material'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import toast from 'react-hot-toast'
import { formatDate, MONTHS } from '../../utils/constants'

const StudentAttendance = () => {
  const { enrollment } = useAuth()
  const [attendance, setAttendance] = useState([])
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    if (enrollment) {
      fetchAttendance()
    }
  }, [month, year, enrollment])

  const fetchAttendance = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/student/attendance?enrollment_id=${enrollment.enrollment_id}&month=${month}&year=${year}`)
      
      if (response.data.status === 'success') {
        const data = response.data.data
        setAttendance(data.records || [])
        setSummary({
          total_days: data.total_days || 0,
          present_days: data.present_days || 0,
          absent_days: data.absent_days || 0
        })
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load attendance')
      toast.error('Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

  if (loading) return <LoadingSpinner message="Loading attendance..." />
  if (error) return <ErrorMessage error={error} onRetry={fetchAttendance} />
  if (!enrollment) return <ErrorMessage error="Enrollment data not available" />

  const attendancePercentage = summary?.total_days > 0
    ? ((summary.present_days / summary.total_days) * 100).toFixed(1)
    : 0

  return (
    <Box className="fade-in">
      <Typography variant="h4" gutterBottom fontWeight={600}>
        My Attendance - {enrollment.academic_year}
      </Typography>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            >
              {MONTHS.map((m) => (
                <MenuItem key={m.value} value={m.value}>
                  {m.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              select
              fullWidth
              label="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            >
              {years.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight={600}>
                {summary?.total_days || 0}
              </Typography>
              <Typography variant="body2">Total Days</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight={600}>
                {summary?.present_days || 0}
              </Typography>
              <Typography variant="body2">Present Days</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight={600}>
                {summary?.absent_days || 0}
              </Typography>
              <Typography variant="body2">Absent Days</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Typography variant="h4" fontWeight={600}>
                {attendancePercentage}%
              </Typography>
              <Typography variant="body2">Attendance Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Attendance Records */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EventNote />
          Attendance Records for {MONTHS.find(m => m.value === month)?.label} {year}
        </Typography>

        {attendance && attendance.length > 0 ? (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {attendance.map((record, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ 
                  border: 2, 
                  borderColor: record.status === 'Present' ? 'success.main' : 'error.main',
                  bgcolor: record.status === 'Present' ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="body1" fontWeight={600}>
                          {formatDate(record.attendance_date)}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: record.status === 'Present' ? 'success.main' : 'error.main',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            mt: 1
                          }}
                        >
                          {record.status === 'Present' ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                          {record.status}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No attendance records found for this period.
          </Typography>
        )}
      </Paper>
    </Box>
  )
}

export default StudentAttendance