import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography,
  } from '@mui/material'
  import { useContext, useEffect, useState } from 'react'
  import api from '../../api/axios'
  import { AuthContext } from '../../auth/AuthContext'
  import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
  } from 'recharts'
  
  const StatCard = ({ title, value }) => (
    <Card sx={{ borderRadius: 3 }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
        <Typography variant="h4" sx={{ mt: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
  
  const Dashboard = () => {
    const { academicYear } = useContext(AuthContext)
  
    const [stats, setStats] = useState({})
    const [fees, setFees] = useState({})
    const [classData, setClassData] = useState([])
  
    useEffect(() => {
      if (!academicYear) return
  
      // Dashboard stats
      api
        .get(`/admin/dashboard/${academicYear.academic_year_id}`)
        .then(res => {
          if (res.data.status === 'success') {
            setStats(res.data.data)
          }
        })
  
      // Fee summary
      api
        .get(`/admin/fees/summary/${academicYear.academic_year_id}`)
        .then(res => {
          if (res.data.status === 'success') {
            setFees(res.data.data)
          }
        })
  
      // Students per class
      api
        .get(`/admin/count/class/${academicYear.academic_year_id}`)
        .then(res => {
          if (res.data.status === 'success') {
            setClassData(res.data.data)
          }
        })
    }, [academicYear])
  
    if (!academicYear) {
      return <Typography>Select academic year</Typography>
    }
  
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Dashboard — {academicYear.year_name}
        </Typography>
  
        {/* STATS */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}>
            <StatCard title="Total Classes" value={stats.total_classes || 0} />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Total Students"
              value={stats.total_students || 0}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Total Teachers"
              value={stats.total_teachers || 0}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard
              title="Total Subjects"
              value={stats.total_subjects || 0}
            />
          </Grid>
        </Grid>
  
        {/* FEES */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <StatCard title="Total Fees" value={fees.total_fees || 0} />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard title="Collected" value={fees.collected || 0} />
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard title="Pending" value={fees.pending || 0} />
          </Grid>
        </Grid>
  
        {/* CHART */}
        <Card sx={{ borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Students per Class
            </Typography>
  
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={classData}>
                <XAxis dataKey="class_level" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_students" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Box>
    )
  }
  
  export default Dashboard
  