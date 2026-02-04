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
  TextField,
  MenuItem
} from '@mui/material'
import { Receipt } from '@mui/icons-material'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import toast from 'react-hot-toast'
import { formatCurrency, formatDate } from '../../utils/constants'

const Transactions = () => {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [limit, setLimit] = useState(10)

  useEffect(() => {
    fetchTransactions()
  }, [limit])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await api.get(
        `/accountant/transactions/recent?limit=${limit}`
      )

      if (response.data.status === 'success') {
        setTransactions(response.data.data)
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load transactions')
      toast.error('Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner message="Loading transactions..." />
  if (error) return <ErrorMessage error={error} onRetry={fetchTransactions} />

  const totalAmount = transactions.reduce(
    (sum, txn) => sum + Number(txn.amount_paid),
    0
  )

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
          Transactions
        </Typography>

        <TextField
          select
          size="small"
          label="Show"
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          sx={{ width: 160 }}
        >
          <MenuItem value={10}>10 Records</MenuItem>
          <MenuItem value={25}>25 Records</MenuItem>
          <MenuItem value={50}>50 Records</MenuItem>
          <MenuItem value={100}>100 Records</MenuItem>
        </TextField>
      </Box>

      {/* ================= TABLE ================= */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          fontWeight={600}
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <Receipt fontSize="small" />
          Payment History
        </Typography>

        {transactions.length > 0 ? (
          <TableContainer sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Receipt</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Student</strong></TableCell>
                  <TableCell><strong>Reg No</strong></TableCell>
                  <TableCell><strong>Class</strong></TableCell>
                  <TableCell><strong>Payment Mode</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {transactions.map((txn) => (
                  <TableRow key={txn.receipt_no} hover>
                    <TableCell>
                      <Chip
                        label={txn.receipt_no}
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell>
                      {formatDate(txn.payment_date)}
                    </TableCell>

                    <TableCell>
                      <Typography fontWeight={600}>
                        {txn.student_name}
                      </Typography>
                    </TableCell>

                    <TableCell>{txn.reg_no}</TableCell>

                    <TableCell>
                      {txn.class_level}-{txn.division}
                    </TableCell>

                    <TableCell>
                      <Chip
                        label={txn.payment_mode}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>

                    <TableCell align="right">
                      <Typography fontWeight={600} color="success.main">
                        {formatCurrency(txn.amount_paid)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography sx={{ mt: 2 }} color="text.secondary">
            No transactions found.
          </Typography>
        )}

        {/* ================= FOOTER SUMMARY ================= */}
        {transactions.length > 0 && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              bgcolor: '#f5f5f5',
              borderRadius: 1
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Total Amount: {formatCurrency(totalAmount)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Showing {transactions.length} recent transactions
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  )
}

export default Transactions
