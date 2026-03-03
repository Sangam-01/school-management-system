import { useState, useEffect } from 'react'
import { Grid, Card, CardContent, Typography, Box } from '@mui/material'
import { Class, MenuBook } from '@mui/icons-material'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import toast from 'react-hot-toast'

const TeacherDashboard = () => {
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [classesRes, subjectsRes] = await Promise.all([
        api.get('/teacher/classes'),
        api.get('/teacher/subjects')
      ])

      if (classesRes.data.status === 'success') {
        setClasses(Array.isArray(classesRes.data.data) ? classesRes.data.data : [])
      }

      if (subjectsRes.data.status === 'success') {
        setSubjects(Array.isArray(subjectsRes.data.data) ? subjectsRes.data.data : [])
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

  return (
    <Box className="fade-in">
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Teacher Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Class sx={{ fontSize: 50 }} />
                <Box>
                  <Typography variant="h3" fontWeight={600}>
                    {classes.length}
                  </Typography>
                  <Typography variant="body1">
                    Classes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <MenuBook sx={{ fontSize: 50 }} />
                <Box>
                  <Typography variant="h3" fontWeight={600}>
                    {subjects.length}
                  </Typography>
                  <Typography variant="body1">
                    Subjects
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                My Classes
              </Typography>
              {classes.length > 0 ? (
                classes.map((cls) => (
                  <Box key={cls.class_id} sx={{ p: 2, mb: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body1" fontWeight={600}>
                      {cls.class_name} - {cls.section}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">No classes assigned</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                My Subjects
              </Typography>
              {subjects.length > 0 ? (
                subjects.map((subject) => (
                  <Box key={subject.subject_id} sx={{ p: 2, mb: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                    <Typography variant="body1" fontWeight={600}>
                      {subject.subject_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {subject.class_name} - {subject.section}
                    </Typography>
                  </Box>
                ))
              ) : (
                <Typography color="text.secondary">No subjects assigned</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TeacherDashboard
