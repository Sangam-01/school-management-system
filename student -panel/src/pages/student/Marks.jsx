import { useState, useEffect } from 'react'
import { Paper, Typography, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material'
import { Assessment } from '@mui/icons-material'
import api from '../../api/axios'
import { useAuth } from '../../auth/useAuth'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import toast from 'react-hot-toast'

const StudentMarks = () => {
  const { enrollment } = useAuth()
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (enrollment) {
      fetchMarks()
    }
  }, [enrollment])

  const fetchMarks = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/student/marks?enrollment_id=${enrollment.enrollment_id}`)
      
      if (response.data.status === 'success') {
        setMarks(response.data.data || [])
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load marks')
      toast.error('Failed to load marks')
    } finally {
      setLoading(false)
    }
  }

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A':
        return 'success'
      case 'B':
        return 'primary'
      case 'C':
        return 'warning'
      case 'D':
        return 'error'
      case 'F':
        return 'error'
      default:
        return 'default'
    }
  }

  if (loading) return <LoadingSpinner message="Loading marks..." />
  if (error) return <ErrorMessage error={error} onRetry={fetchMarks} />
  if (!enrollment) return <ErrorMessage error="Enrollment data not available" />

  return (
    <Box className="fade-in">
      <Typography variant="h4" gutterBottom fontWeight={600}>
        My Marks - {enrollment.academic_year}
      </Typography>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Assessment />
          Examination Results (Class {enrollment.class_level}-{enrollment.division})
        </Typography>

        {marks && marks.length > 0 ? (
          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Subject</strong></TableCell>
                  <TableCell><strong>Exam</strong></TableCell>
                  <TableCell align="center"><strong>Marks Obtained</strong></TableCell>
                  <TableCell align="center"><strong>Max Marks</strong></TableCell>
                  <TableCell align="center"><strong>Percentage</strong></TableCell>
                  <TableCell align="center"><strong>Grade</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marks.map((mark, index) => {
                  const percentage = mark.max_marks > 0 
                    ? ((mark.marks_obtained / mark.max_marks) * 100).toFixed(1)
                    : 0
                  
                  return (
                    <TableRow key={index} hover>
                      <TableCell>{mark.subject_name}</TableCell>
                      <TableCell>{mark.exam_name}</TableCell>
                      <TableCell align="center">{mark.marks_obtained}</TableCell>
                      <TableCell align="center">{mark.max_marks}</TableCell>
                      <TableCell align="center">{percentage}%</TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={mark.grade} 
                          color={getGradeColor(mark.grade)} 
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary" sx={{ mt: 2 }}>
            No marks recorded yet for this academic year.
          </Typography>
        )}
      </Paper>
    </Box>
  )
}

export default StudentMarks