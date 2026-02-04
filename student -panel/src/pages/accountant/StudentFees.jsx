import { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../utils/constants'
import LoadingSpinner from '../../components/common/LoadingSpinner'

const StudentFees = () => {
  const [allStudents, setAllStudents] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)

  const [selectedClass, setSelectedClass] = useState('')

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [amount, setAmount] = useState('')
  const [assignedDate, setAssignedDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    fetchStudents()
  }, [])

  /* ================= FETCH STUDENTS ================= */
  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await api.get('/accountant/students/fees')
      if (response.data.status === 'success') {
        setAllStudents(response.data.data)
        setStudents(response.data.data)
      }
    } catch {
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  /* ================= UNIQUE CLASS LIST ================= */
  const classes = Array.from(
    new Set(
      allStudents.map(
        (s) => `${s.class_level}-${s.division}`
      )
    )
  )

  /* ================= ASSIGN FEE ================= */
  const handleAssignFee = async () => {
    if (!selectedStudent) return

    if (!amount || Number(amount) <= 0) {
      toast.error('Please enter a valid amount')
      return
    }

    try {
      const response = await api.post('/accountant/fees/assign', {
        enrollment_id: selectedStudent.enrollment_id,
        total_amount: Number(amount),
        assigned_date: assignedDate
      })

      if (response.data.status === 'success') {
        toast.success('Fee assigned successfully')
        setDialogOpen(false)
        setAmount('')
        setSelectedStudent(null)
        fetchStudents()
      }
    } catch {
      toast.error('Failed to assign fee')
    }
  }

  /* ================= COLLECT FEE ================= */
  const handleCollectFee = async (student) => {
    if (student.total_pending <= 0) {
      toast('No pending amount')
      return
    }

    const amountPaid = prompt(
      `Enter amount to collect (Pending: ${student.total_pending})`
    )

    if (!amountPaid || Number(amountPaid) <= 0) return

    try {
      const response = await api.post('/accountant/fees/collect', {
        enrollment_id: student.enrollment_id,
        amount_paid: Number(amountPaid),
        payment_date: new Date().toISOString().split('T')[0],
        payment_mode: 'Cash'
      })

      if (response.data.status === 'success') {
        toast.success(
          `Payment recorded! Receipt: ${response.data.data.receipt_no}`
        )
        fetchStudents()
      }
    } catch {
      toast.error('Failed to collect fee')
    }
  }

  if (loading) return <LoadingSpinner message="Loading students..." />

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Student Fee Management
      </Typography>

      {/* ================= CLASS FILTER ================= */}
      <Box sx={{ mb: 2, maxWidth: 280 }}>
        <FormControl fullWidth size="small">
          <InputLabel>Filter by Class</InputLabel>
          <Select
            label="Filter by Class"
            value={selectedClass}
            onChange={(e) => {
              const value = e.target.value
              setSelectedClass(value)

              if (!value) {
                setStudents(allStudents)
              } else {
                const filtered = allStudents.filter(
                  (s) => `${s.class_level}-${s.division}` === value
                )
                setStudents(filtered)
              }
            }}
          >
            <MenuItem value="">
              <em>All Classes</em>
            </MenuItem>

            {classes.map((cls) => (
              <MenuItem key={cls} value={cls}>
                Class {cls}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* ================= TABLE ================= */}
      <Paper sx={{ p: 3 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Pending</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No students found
                </TableCell>
              </TableRow>
            )}

            {students.map((student) => (
              <TableRow key={student.enrollment_id}>
                <TableCell>{student.student_name}</TableCell>
                <TableCell>
                  {student.class_level}-{student.division}
                </TableCell>
                <TableCell>
                  {formatCurrency(student.total_amount)}
                </TableCell>
                <TableCell>
                  {formatCurrency(student.total_paid)}
                </TableCell>
                <TableCell>
                  <Typography
                    fontWeight={600}
                    color={student.total_pending > 0 ? 'error' : 'success.main'}
                  >
                    {formatCurrency(student.total_pending)}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="outlined"
                    sx={{ mr: 1 }}
                    onClick={() => {
                      setSelectedStudent(student)
                      setDialogOpen(true)
                    }}
                  >
                    Assign
                  </Button>

                  <Button
                    size="small"
                    variant="contained"
                    disabled={student.total_pending <= 0}
                    onClick={() => handleCollectFee(student)}
                  >
                    Collect
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* ================= ASSIGN DIALOG ================= */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Assign Fee – {selectedStudent?.student_name}
        </DialogTitle>

        <DialogContent>
          <TextField
            fullWidth
            label="Total Amount (₹)"
            type="number"
            margin="normal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            autoFocus
          />

          <TextField
            fullWidth
            label="Assigned Date"
            type="date"
            margin="normal"
            value={assignedDate}
            onChange={(e) => setAssignedDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignFee}>
            Assign Fee
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default StudentFees
