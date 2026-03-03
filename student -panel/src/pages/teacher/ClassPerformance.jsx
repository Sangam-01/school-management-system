import { useState, useEffect } from 'react'
import {
  Paper, Typography, Box, Grid, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, LinearProgress, Avatar
} from '@mui/material'
import { TrendingUp, EmojiEvents, Stars, Assessment } from '@mui/icons-material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import toast from 'react-hot-toast'

const ClassPerformance = () => {
  const [performance, setPerformance] = useState([])
  const [topStudents, setTopStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPerformanceData()
  }, [])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [performanceRes, topStudentsRes] = await Promise.all([
        api.get('/teacher/class/performance'),
        api.get('/teacher/class/top-students')
      ])

      if (performanceRes.data.status === 'success') {
        setPerformance(performanceRes.data.data)
      }

      if (topStudentsRes.data.status === 'success') {
        setTopStudents(topStudentsRes.data.data)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load performance data')
      toast.error('Failed to load class performance')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading performance data..." />
  if (error) return <ErrorMessage error={error} onRetry={fetchPerformanceData} />

  // Calculate statistics
  const totalStudents = performance.length
  const averagePercentage = totalStudents > 0
    ? (performance.reduce((sum, s) => sum + parseFloat(s.percentage || 0), 0) / totalStudents).toFixed(2)
    : 0
  const passedStudents = performance.filter(s => parseFloat(s.percentage) >= 40).length
  const passPercentage = totalStudents > 0 ? ((passedStudents / totalStudents) * 100).toFixed(1) : 0

  // Prepare chart data
  const chartData = performance.slice(0, 10).map(student => ({
    name: `${student.student_name.split(' ')[0]}`,
    percentage: parseFloat(student.percentage)
  }))

  const getGradeColor = (percentage) => {
    const p = parseFloat(percentage)
    if (p >= 90) return 'success'
    if (p >= 80) return 'primary'
    if (p >= 70) return 'info'
    if (p >= 60) return 'warning'
    if (p >= 40) return 'secondary'
    return 'error'
  }

  const getGrade = (percentage) => {
    const p = parseFloat(percentage)
    if (p >= 90) return 'A+'
    if (p >= 80) return 'A'
    if (p >= 70) return 'B'
    if (p >= 60) return 'C'
    if (p >= 40) return 'D'
    return 'F'
  }

  return (
    <Box className="fade-in">
      {/* Header */}
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
              Class Performance Analytics
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Comprehensive overview of your class academic performance
            </Typography>
          </Box>
          <Assessment sx={{ fontSize: 60, opacity: 0.3 }} />
        </Box>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)',
            height: '100%'
          }}>
            <CardContent>
              <TrendingUp sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight={600}>
                {totalStudents}
              </Typography>
              <Typography variant="body2">Total Students</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(56, 239, 125, 0.3)',
            height: '100%'
          }}>
            <CardContent>
              <Assessment sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight={600}>
                {averagePercentage}%
              </Typography>
              <Typography variant="body2">Class Average</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(245, 87, 108, 0.3)',
            height: '100%'
          }}>
            <CardContent>
              <EmojiEvents sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight={600}>
                {passedStudents}
              </Typography>
              <Typography variant="body2">Students Passed</Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(254, 225, 64, 0.3)',
            height: '100%'
          }}>
            <CardContent>
              <Stars sx={{ fontSize: 40, mb: 1, opacity: 0.8 }} />
              <Typography variant="h3" fontWeight={600}>
                {passPercentage}%
              </Typography>
              <Typography variant="body2">Pass Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Top Performers */}
      {topStudents && topStudents.length > 0 && (
        <Paper sx={{
          p: 3,
          mb: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderRadius: 3,
          background: 'linear-gradient(to right, #ffeaa7 0%, #fdcb6e 100%)'
        }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EmojiEvents sx={{ color: '#f39c12' }} />
            🏆 Top 3 Performers
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {topStudents.slice(0, 3).map((student, index) => (
              <Grid item xs={12} sm={4} key={student.student_id}>
                <Card sx={{
                  background: index === 0 ? 'linear-gradient(135deg, #f39c12 0%, #f1c40f 100%)'
                    : index === 1 ? 'linear-gradient(135deg, #95a5a6 0%, #bdc3c7 100%)'
                      : 'linear-gradient(135deg, #cd6133 0%, #e67e22 100%)',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{
                        width: 50,
                        height: 50,
                        bgcolor: 'white',
                        color: '#f39c12',
                        fontWeight: 600,
                        fontSize: '1.5rem',
                        mr: 2
                      }}>
                        {index + 1}
                      </Avatar>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>
                          {student.student_name}
                        </Typography>
                        <Typography variant="caption">
                          Roll: {student.roll_no}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="caption">Score</Typography>
                        <Typography variant="h5" fontWeight={600}>
                          {student.percentage}%
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption">Marks</Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {student.total_marks_obtained}/{student.total_max_marks}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{
            p: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 3
          }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Performance Distribution (Top 10)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="percentage" fill="#667eea" name="Percentage %" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{
            p: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            borderRadius: 3
          }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Performance Trend
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="percentage" stroke="#667eea" strokeWidth={3} name="Percentage %" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Complete Performance Table */}
      <Paper sx={{
        p: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        borderRadius: 3
      }}>
        <Typography variant="h6" gutterBottom fontWeight={600}>
          Complete Class Performance
        </Typography>

        {performance && performance.length > 0 ? (
          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Rank</strong></TableCell>
                  <TableCell><strong>Roll No</strong></TableCell>
                  <TableCell><strong>Student Name</strong></TableCell>
                  <TableCell align="center"><strong>Subjects</strong></TableCell>
                  <TableCell align="center"><strong>Marks Obtained</strong></TableCell>
                  <TableCell align="center"><strong>Total Marks</strong></TableCell>
                  <TableCell align="center"><strong>Percentage</strong></TableCell>
                  <TableCell align="center"><strong>Grade</strong></TableCell>
                  <TableCell><strong>Progress</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performance
                  .sort((a, b) => parseFloat(b.percentage) - parseFloat(a.percentage))
                  .map((student, index) => {
                    const percentage = parseFloat(student.percentage)
                    return (
                      <TableRow key={student.student_id} hover>
                        <TableCell>
                          <Chip
                            label={`#${index + 1}`}
                            color={index < 3 ? 'success' : 'default'}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography fontWeight={600}>
                            {student.roll_no}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight={600}>
                            {student.student_name}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={student.total_subjects} size="small" />
                        </TableCell>
                        <TableCell align="center">
                          <Typography color="primary" fontWeight={600}>
                            {student.total_marks_obtained}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          {student.total_max_marks}
                        </TableCell>
                        <TableCell align="center">
                          <Typography variant="h6" fontWeight={600}>
                            {percentage}%
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={getGrade(percentage)}
                            color={getGradeColor(percentage)}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ width: '100%' }}>
                            <LinearProgress
                              variant="determinate"
                              value={percentage > 100 ? 100 : percentage}
                              sx={{
                                height: 8,
                                borderRadius: 5,
                                bgcolor: '#e0e0e0',
                                '& .MuiLinearProgress-bar': {
                                  borderRadius: 5,
                                  bgcolor: percentage >= 90 ? '#4caf50'
                                    : percentage >= 70 ? '#2196f3'
                                      : percentage >= 40 ? '#ff9800'
                                        : '#f44336'
                                }
                              }}
                            />
                          </Box>
                        </TableCell>
                      </TableRow>
                    )
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Assessment sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No performance data available yet
            </Typography>
            <Typography color="text.secondary">
              Students need to have marks recorded first
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default ClassPerformance