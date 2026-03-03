import { useState, useEffect } from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material'
import { BarChart } from '@mui/icons-material'
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import toast from 'react-hot-toast'
import { formatCurrency, MONTHS } from '../../utils/constants'

const Reports = () => {
  const [reportType, setReportType] = useState('monthly')
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reportData, setReportData] = useState(null)
  const [classWiseData, setClassWiseData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchClassWiseReport()
  }, [])

  /* ================= CLASS WISE ================= */
  const fetchClassWiseReport = async () => {
    try {
      const response = await api.get('/accountant/reports/class-wise')
      if (response.data.status === 'success') {
        setClassWiseData(response.data.data)
      }
    } catch {
      toast.error('Failed to load class-wise report')
    }
  }

  /* ================= GENERATE REPORT ================= */
  const handleGenerateReport = async () => {
    try {
      setLoading(true)
      setError(null)
      let response

      if (reportType === 'monthly') {
        response = await api.get(
          `/accountant/reports/monthly?month=${month}&year=${year}`
        )
      }

      if (reportType === 'daterange') {
        if (!startDate || !endDate) {
          toast.error('Please select start and end date')
          return
        }

        response = await api.get(
          `/accountant/reports/date-range?start_date=${startDate}&end_date=${endDate}`
        )
      }

      if (response.data.status === 'success') {
        setReportData(response.data.data)
        toast.success('Report generated')
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError('Failed to generate report')
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const years = Array.from({ length: 5 }, (_, i) => year - i)

  /* ================= CHART DATA (UNCHANGED STRUCTURE) ================= */
  const getChartData = () => {
    if (!classWiseData.length) return []
    return classWiseData.map((item) => ({
      name: `${item.class_level}-${item.division}`,
      Collected: Number(item.collected || 0),
      Pending: Number(item.pending || 0),
      Overdue: Number(item.overdue || 0) // safe fallback
    }))
  }

  return (
    <Box className="fade-in">
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Fee Reports & Analytics
      </Typography>

      {/* ================= REPORT GENERATOR ================= */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Generate Report
        </Typography>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <TextField
              select
              fullWidth
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="daterange">Date Range</MenuItem>
            </TextField>
          </Grid>

          {reportType === 'monthly' && (
            <>
              <Grid item xs={12} sm={3}>
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

              <Grid item xs={12} sm={3}>
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
            </>
          )}

          {reportType === 'daterange' && (
            <>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="Start Date"
                  InputLabelProps={{ shrink: true }}
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  type="date"
                  label="End Date"
                  InputLabelProps={{ shrink: true }}
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </Grid>
            </>
          )}

          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleGenerateReport}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate'}
            </Button>
          </Grid>
        </Grid>

        {/* ================= REPORT RESULT ================= */}
        {loading && <LoadingSpinner message="Generating report..." />}
        {error && <ErrorMessage error={error} />}

        {reportData && reportType === 'monthly' && (
          <Box sx={{ mt: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Total Assigned</TableCell>
                    <TableCell>Total Collected</TableCell>
                    <TableCell>Total Pending</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      {formatCurrency(reportData.total_assigned)}
                    </TableCell>
                    <TableCell>
                      <Typography color="success.main" fontWeight={600}>
                        {formatCurrency(reportData.total_collected)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography color="error.main" fontWeight={600}>
                        {formatCurrency(reportData.total_pending)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}

        {reportData && reportType === 'daterange' && (
          <Box sx={{ mt: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell align="center">Transactions</TableCell>
                    <TableCell align="right">Collected</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>{row.payment_date}</TableCell>
                      <TableCell align="center">
                        {row.transactions}
                      </TableCell>
                      <TableCell align="right">
                        <Typography color="success.main" fontWeight={600}>
                          {formatCurrency(row.total_collected)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Paper>

      {/* ================= CLASS WISE ================= */}
      <Paper sx={{ p: 3 }}>
        <Typography
          variant="h6"
          fontWeight={600}
          gutterBottom
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <BarChart />
          Class-wise Fee Summary
        </Typography>

        {classWiseData.length > 0 ? (
          <>
            {/* 🔒 SAME GRAPH – NOT CHANGED */}
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBar data={getChartData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(v) => formatCurrency(v)} />
                <Legend />
                <Bar dataKey="Collected" fill="#4caf50" />
                <Bar dataKey="Pending" fill="#ff9800" />
                <Bar dataKey="Overdue" fill="#f44336" />
              </RechartsBar>
            </ResponsiveContainer>

            <TableContainer sx={{ mt: 3 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Class</TableCell>
                    <TableCell align="center">Students</TableCell>
                    <TableCell align="right">Collected</TableCell>
                    <TableCell align="right">Pending</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {classWiseData.map((row, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        {row.class_level}-{row.division}
                      </TableCell>
                      <TableCell align="center">
                        {row.total_students}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(row.collected)}
                      </TableCell>
                      <TableCell align="right">
                        {formatCurrency(row.pending)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Typography color="text.secondary">
            No class-wise data available
          </Typography>
        )}
      </Paper>
    </Box>
  )
}

export default Reports
