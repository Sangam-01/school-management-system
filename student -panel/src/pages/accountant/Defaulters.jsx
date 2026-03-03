import { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button
} from '@mui/material'
import { Warning, Print } from '@mui/icons-material'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import toast from 'react-hot-toast'
import { formatCurrency } from '../../utils/constants'

const Defaulters = () => {
  const [defaulters, setDefaulters] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDefaulters()
  }, [])

  const fetchDefaulters = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get('/accountant/defaulters')

      if (response.data.status === 'success') {
        setDefaulters(response.data.data)
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError('Failed to load defaulters')
      toast.error('Failed to load defaulters list')
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getTotalPending = () =>
    defaulters.reduce(
      (sum, d) => sum + Number(d.total_pending),
      0
    )

  if (loading) return <LoadingSpinner message="Loading defaulters..." />
  if (error) return <ErrorMessage error={error} onRetry={fetchDefaulters} />

  return (
    <Box className="fade-in">
      {/* ================= HEADER ================= */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3
        }}
      >
        <Typography variant="h4" fontWeight={600}>
          Fee Defaulters
        </Typography>

        <Button
          variant="outlined"
          startIcon={<Print />}
          onClick={handlePrint}
          className="no-print"
        >
          Print Report
        </Button>
      </Box>

      {/* ================= SUMMARY ================= */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }} className="no-print">
        <Paper sx={{ p: 2, flex: 1, bgcolor: '#fff3e0' }}>
          <Typography variant="body2" color="text.secondary">
            Total Defaulters
          </Typography>
          <Typography variant="h4" fontWeight={600} color="warning.main">
            {defaulters.length}
          </Typography>
        </Paper>

        <Paper sx={{ p: 2, flex: 1, bgcolor: '#ffebee' }}>
          <Typography variant="body2" color="text.secondary">
            Total Pending Amount
          </Typography>
          <Typography variant="h4" fontWeight={600} color="error.main">
            {formatCurrency(getTotalPending())}
          </Typography>
        </Paper>
      </Box>

      {/* ================= TABLE ================= */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          gutterBottom
          fontWeight={600}
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Warning color="error" />
          Students with Pending Fees
        </Typography>

        {defaulters.length > 0 ? (
          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Reg No</TableCell>
                  <TableCell>Student</TableCell>
                  <TableCell>Roll No</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Mobile</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="right">Pending Amount</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {defaulters.map((student) => (
                  <TableRow key={student.enrollment_id} hover>
                    <TableCell>{student.reg_no}</TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>
                        {student.student_name}
                      </Typography>
                    </TableCell>

                    <TableCell>{student.roll_no}</TableCell>

                    <TableCell>
                      {student.class_level}-{student.division}
                    </TableCell>

                    <TableCell>{student.mobile || '-'}</TableCell>

                    <TableCell align="center">
                      <Chip
                        label="Pending"
                        color="warning"
                        size="small"
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Typography
                        fontWeight={600}
                        color="error.main"
                      >
                        {formatCurrency(student.total_pending)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ textAlign: 'center', py: 5 }}>
            <Typography variant="h6" color="success.main">
              🎉 No Defaulters Found!
            </Typography>
            <Typography color="text.secondary">
              All students have cleared their dues.
            </Typography>
          </Box>
        )}

        {/* ================= FOOTER ================= */}
        {defaulters.length > 0 && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: '#f5f5f5',
              borderRadius: 1
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <Typography fontWeight={600}>
                Total Defaulters
              </Typography>
              <Typography fontWeight={600}>
                {defaulters.length}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                mt: 1
              }}
            >
              <Typography fontWeight={600}>
                Grand Total Pending
              </Typography>
              <Typography
                fontWeight={600}
                color="error.main"
              >
                {formatCurrency(getTotalPending())}
              </Typography>
            </Box>
          </Box>
        )}
      </Paper>

      {/* ================= PRINT STYLE ================= */}
      <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
        }
      `}</style>
    </Box>
  )
}

export default Defaulters
