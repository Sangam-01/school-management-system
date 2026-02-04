import { useState, useEffect } from 'react'
import { Grid, Card, CardContent, Typography, Box, Paper, LinearProgress, Chip } from '@mui/material'
import { School, EventNote, Assessment, CalendarToday, Person } from '@mui/icons-material'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import toast from 'react-hot-toast'

const StudentDashboard = () => {
  const { enrollment } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (enrollment) {
      fetchDashboardData()
    }
  }, [enrollment])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/student/dashboard')
      
      if (response.data.status === 'success') {
        setData(response.data.data)
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading dashboard..." />
  if (error) return <ErrorMessage error={error} onRetry={fetchDashboardData} />
  if (!data || !enrollment) return null

  const attendancePercentage = data.total_days > 0 
    ? ((data.present_days / data.total_days) * 100).toFixed(1)
    : 0

  const subjects = data.subjects  //? JSON.parse(data.subjects) : []

  return (
    <Box className="fade-in">
      {/* Header with Academic Year */}
      <Box sx={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: 3,
        p: 3,
        mb: 3,
        color: 'white'
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" fontWeight={600} gutterBottom>
              Student Dashboard
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Chip 
                icon={<CalendarToday />}
                label={`Academic Year: ${enrollment.academic_year}`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
              />
              <Chip 
                icon={<Person />}
                label={`Roll No: ${enrollment.roll_no}`}
                sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontWeight: 600 }}
              />
            </Box>
          </Box>
          <School sx={{ fontSize: 60, opacity: 0.3 }} />
        </Box>
      </Box>

      {/* Class Info & Attendance Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Class Info Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <School sx={{ fontSize: 50, mr: 2 }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    Class {enrollment.class_level} - {enrollment.division}
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    Roll Number: {enrollment.roll_no}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2">
                Class Teacher: {enrollment.class_teacher || 'Not Assigned'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance Card */}
        <Grid item xs={12} md={6}>
          <Card sx={{ 
            height: '100%', 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            color: 'white',
            boxShadow: '0 4px 20px rgba(245, 87, 108, 0.3)'
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <EventNote sx={{ fontSize: 50, mr: 2 }} />
                <Box>
                  <Typography variant="h3" fontWeight={600}>
                    {attendancePercentage}%
                  </Typography>
                  <Typography variant="body1">
                    Overall Attendance
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Present: {data.present_days} / {data.total_days} days
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={parseFloat(attendancePercentage)} 
                sx={{ 
                  height: 10,
                  borderRadius: 5,
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: 'white',
                    borderRadius: 5
                  }
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Academic Info Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', 
            color: 'white',
            boxShadow: '0 4px 20px rgba(56, 239, 125, 0.3)'
          }}>
            <CardContent>
              <Assessment sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
              <Typography variant="h4" fontWeight={600}>
                {subjects.length}
              </Typography>
              <Typography variant="body2">Total Subjects</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', 
            color: 'white',
            boxShadow: '0 4px 20px rgba(254, 225, 64, 0.3)'
          }}>
            <CardContent>
              <EventNote sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
              <Typography variant="h4" fontWeight={600}>
                {data.present_days}
              </Typography>
              <Typography variant="body2">Days Present</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
          }}>
            <CardContent>
              <School sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
              <Typography variant="h4" fontWeight={600}>
                Class {enrollment.class_level}
              </Typography>
              <Typography variant="body2">Current Grade</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
            color: 'white',
            boxShadow: '0 4px 20px rgba(245, 87, 108, 0.3)'
          }}>
            <CardContent>
              <CalendarToday sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
              <Typography variant="h6" fontWeight={600}>
                {enrollment.academic_year}
              </Typography>
              <Typography variant="body2">Academic Year</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Subjects List */}
      <Paper sx={{ p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment />
          My Subjects ({enrollment.academic_year})
        </Typography>
        
        {subjects && subjects.length > 0 ? (
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {subjects.map((subject, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
                <Card sx={{ 
                  bgcolor: '#f5f5f5',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom fontWeight={600}>
                      {subject}
                    </Typography>
                    <Chip 
                      label={`Class ${enrollment.class_level}-${enrollment.division}`} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No subjects assigned yet for this academic year.
          </Typography>
        )}
      </Paper>
    </Box>
  )
}

export default StudentDashboard