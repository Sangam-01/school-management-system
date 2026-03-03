import { useState, useEffect } from 'react'
import {
  Paper, Typography, Box, Button, Grid, TextField, MenuItem, Card,
  CardContent, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Alert
} from '@mui/material'
import { Assessment, Add, Save, EmojiEvents } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import toast from 'react-hot-toast'

const TeacherMarks = () => {
  const [subjects, setSubjects] = useState([])
  const [students, setStudents] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [examName, setExamName] = useState('')
  const [maxMarks, setMaxMarks] = useState('')
  const [marksData, setMarksData] = useState({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const { register, handleSubmit, reset } = useForm()

  useEffect(() => {
    fetchSubjects()
  }, [])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/teacher/subjects')

      if (response.data.status === 'success') {
        setSubjects(response.data.data)
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load subjects')
      toast.error('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  const handleSubjectChange = async (subjectId) => {
    setSelectedSubject(subjectId)
    
    // Find the class_id for this subject
    const subject = subjects.find(s => s.subject_id === parseInt(subjectId))
    if (!subject) return

    try {
      const response = await api.get('/teacher/class/students')
      if (response.data.status === 'success') {
        setStudents(response.data.data)
        // Initialize marks data
        const initialMarks = {}
        response.data.data.forEach(student => {
          initialMarks[student.student_id] = ''
        })
        setMarksData(initialMarks)
      }
    } catch (err) {
      toast.error('Failed to load students')
    }
  }

  const handleMarksChange = (studentId, value) => {
    setMarksData(prev => ({
      ...prev,
      [studentId]: value
    }))
  }

  const calculateGrade = (obtained, max) => {
    if (!obtained || !max) return '-'
    const percentage = (parseFloat(obtained) / parseFloat(max)) * 100
    if (percentage >= 90) return 'A+'
    if (percentage >= 80) return 'A'
    if (percentage >= 70) return 'B'
    if (percentage >= 60) return 'C'
    if (percentage >= 40) return 'D'
    return 'F'
  }

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A+':
      case 'A': return 'success'
      case 'B': return 'primary'
      case 'C': return 'warning'
      case 'D': return 'error'
      case 'F': return 'error'
      default: return 'default'
    }
  }

  const handleOpenDialog = () => {
    if (!selectedSubject) {
      toast.error('Please select a subject first')
      return
    }
    if (students.length === 0) {
      toast.error('No students found')
      return
    }
    setDialogOpen(true)
  }

  const handleSubmitMarks = async () => {
    if (!examName || !maxMarks) {
      toast.error('Please enter exam name and max marks')
      return
    }

    // Validate marks
    const marksArray = Object.entries(marksData)
      .filter(([_, marks]) => marks !== '')
      .map(([studentId, marks]) => ({
        student_id: parseInt(studentId),
        marks_obtained: parseFloat(marks)
      }))

    if (marksArray.length === 0) {
      toast.error('Please enter marks for at least one student')
      return
    }

    try {
      setSubmitting(true)
      const response = await api.post('/teacher/marks/add', {
        subject_id: parseInt(selectedSubject),
        exam_name: examName,
        max_marks: parseFloat(maxMarks),
        marks: marksArray
      })

      if (response.data.status === 'success') {
        toast.success('Marks submitted successfully!')
        setDialogOpen(false)
        setExamName('')
        setMaxMarks('')
        setMarksData({})
      } else {
        toast.error(response.data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit marks')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading subjects..." />
  if (error) return <ErrorMessage error={error} onRetry={fetchSubjects} />

  const subject = subjects.find(s => s.subject_id === parseInt(selectedSubject))

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
              Marks Management
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Enter and manage student examination marks
            </Typography>
          </Box>
          <Assessment sx={{ fontSize: 60, opacity: 0.3 }} />
        </Box>
      </Box>

      {/* Subject Selection */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Select Subject
            </Typography>
            <TextField
              select
              fullWidth
              label="Choose Subject"
              value={selectedSubject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              sx={{ mt: 2 }}
            >
              <MenuItem value="">Select a subject</MenuItem>
              {subjects.map((sub) => (
                <MenuItem key={sub.subject_id} value={sub.subject_id}>
                  {sub.subject_name} - {sub.class_name} {sub.section}
                </MenuItem>
              ))}
            </TextField>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white',
            boxShadow: '0 4px 20px rgba(56, 239, 125, 0.3)',
            height: '100%'
          }}>
            <CardContent>
              <EmojiEvents sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="h4" fontWeight={600}>
                {students.length}
              </Typography>
              <Typography variant="body2">
                Students Ready
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Selected Subject Info */}
      {selectedSubject && subject && (
        <>
          <Alert severity="success" sx={{ mb: 3 }}>
            <strong>Selected:</strong> {subject.subject_name} for {subject.class_name} - {subject.section}
          </Alert>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<Add />}
              onClick={handleOpenDialog}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                px: 4
              }}
            >
              Enter Marks for Exam
            </Button>
          </Box>
        </>
      )}

      {/* Students Table */}
      {selectedSubject && students.length > 0 && (
        <Paper sx={{
          p: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          borderRadius: 3
        }}>
          <Typography variant="h6" gutterBottom fontWeight={600}>
            Student List - {subject?.class_name} {subject?.section}
          </Typography>

          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell><strong>Roll No</strong></TableCell>
                  <TableCell><strong>Student Name</strong></TableCell>
                  <TableCell><strong>Reg No</strong></TableCell>
                  <TableCell><strong>Gender</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.student_id} hover>
                    <TableCell>
                      <Typography fontWeight={600}>
                        {student.roll_no}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>
                        {student.fname} {student.mname} {student.lname}
                      </Typography>
                    </TableCell>
                    <TableCell>{student.reg_no}</TableCell>
                    <TableCell>
                      <Chip label={student.gender} size="small" variant="outlined" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Marks Entry Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#667eea', color: 'white' }}>
          <Typography variant="h6" fontWeight={600}>
            Enter Examination Marks
          </Typography>
          <Typography variant="body2">
            {subject?.subject_name} - {subject?.class_name} {subject?.section}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Exam Name"
                value={examName}
                onChange={(e) => setExamName(e.target.value)}
                placeholder="e.g., Mid-Term, Final, Unit Test 1"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Maximum Marks"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                placeholder="e.g., 100"
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" gutterBottom fontWeight={600} sx={{ mb: 2 }}>
            Enter marks for each student:
          </Typography>

          <TableContainer sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Roll</strong></TableCell>
                  <TableCell><strong>Student Name</strong></TableCell>
                  <TableCell width="150px"><strong>Marks Obtained</strong></TableCell>
                  <TableCell align="center"><strong>Grade</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => {
                  const marks = marksData[student.student_id]
                  const grade = calculateGrade(marks, maxMarks)
                  
                  return (
                    <TableRow key={student.student_id}>
                      <TableCell>{student.roll_no}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {student.fname} {student.lname}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          size="small"
                          fullWidth
                          value={marks}
                          onChange={(e) => handleMarksChange(student.student_id, e.target.value)}
                          inputProps={{ min: 0, max: maxMarks }}
                          placeholder="Enter marks"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {marks && maxMarks ? (
                          <Chip
                            label={grade}
                            color={getGradeColor(grade)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitMarks}
            disabled={submitting}
            startIcon={<Save />}
            sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
          >
            {submitting ? 'Submitting...' : 'Submit Marks'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default TeacherMarks