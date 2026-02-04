import { useState, useEffect } from 'react'
import { Grid, Card, CardContent, Typography, Box } from '@mui/material'
import { AttachMoney, People, Warning, TrendingUp } from '@mui/icons-material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import { formatCurrency } from '../../utils/constants'
import toast from 'react-hot-toast'

const AccountantDashboard = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/accountant/dashboard')
      
      if (response.data.status === 'success') {
        setStats(response.data.data)
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
  if (!stats) return null

  const pieData = [
    { name: 'Collected', value: parseFloat(stats.total_collected), color: '#4caf50' },
    { name: 'Pending', value: parseFloat(stats.total_pending), color: '#ff9800' },
    { name: 'Overdue', value: parseFloat(stats.total_overdue), color: '#f44336' },
  ]

  const barData = [
    { name: 'Collected', amount: parseFloat(stats.total_collected) },
    { name: 'Pending', amount: parseFloat(stats.total_pending) },
    { name: 'Overdue', amount: parseFloat(stats.total_overdue) },
  ]

  return (
    <Box className="fade-in">
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Accountant Dashboard
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <People sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight={600}>
                    {stats.total_students}
                  </Typography>
                  <Typography variant="body2">
                    Total Students
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AttachMoney sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {formatCurrency(stats.monthly_collection)}
                  </Typography>
                  <Typography variant="body2">
                    This Month
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <TrendingUp sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {formatCurrency(stats.total_collected)}
                  </Typography>
                  <Typography variant="body2">
                    Total Collected
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Warning sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {formatCurrency(stats.total_overdue)}
                  </Typography>
                  <Typography variant="body2">
                    Overdue Fees
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Fee Collection Overview
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Bar dataKey="amount" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Fee Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${formatCurrency(entry.value)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AccountantDashboard
