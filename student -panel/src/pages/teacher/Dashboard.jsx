import { useState, useEffect } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Paper, Avatar, Chip, Divider
} from '@mui/material'
import { Class, MenuBook, People, TrendingUp, CalendarToday, CheckCircleOutline } from '@mui/icons-material'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import toast from 'react-hot-toast'

const COLORS = ['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#06b6d4','#14b8a6','#f59e0b','#ef4444']

const TeacherDashboard = () => {
  const [stats, setStats] = useState(null)
  const [classes, setClasses] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => { fetchAll() }, [])

  const fetchAll = async () => {
    try {
      setLoading(true)
      setError(null)
      const [sRes, cRes, subRes] = await Promise.all([
        api.get('/teacher/dashboard'),
        api.get('/teacher/classes'),
        api.get('/teacher/subjects')
      ])
      if (sRes.data.status === 'success') setStats(sRes.data.data)
      if (cRes.data.status === 'success') setClasses(cRes.data.data)
      if (subRes.data.status === 'success') setSubjects(subRes.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load')
      toast.error('Failed to load dashboard')
    } finally { setLoading(false) }
  }

  if (loading) return <LoadingSpinner message="Loading dashboard..." />
  if (error) return <ErrorMessage error={error} onRetry={fetchAll} />
  if (!stats) return null

  const chartData = classes.map(c => ({
    name: `${c.class_level}${c.division}`,
    students: c.student_count || 0
  }))

  const statCards = [
    { label: 'Classes', value: stats.total_classes, icon: <Class sx={{ fontSize: 28 }} />, grad: 'linear-gradient(135deg,#6366f1,#8b5cf6)' },
    { label: 'Subjects', value: stats.total_subjects, icon: <MenuBook sx={{ fontSize: 28 }} />, grad: 'linear-gradient(135deg,#06b6d4,#0891b2)' },
    { label: 'Students', value: stats.total_students, icon: <People sx={{ fontSize: 28 }} />, grad: 'linear-gradient(135deg,#10b981,#059669)' },
    { label: 'Avg / Class', value: stats.total_classes ? Math.round(stats.total_students / stats.total_classes) : 0, icon: <TrendingUp sx={{ fontSize: 28 }} />, grad: 'linear-gradient(135deg,#f59e0b,#d97706)' }
  ]

  return (
    <Box>
      {/* ---- Header ---- */}
      <Box sx={{
        background: 'linear-gradient(135deg,#1e1b4b 0%,#312e81 100%)',
        borderRadius: 3, p: '28px 32px', mb: 3, color: '#fff', position: 'relative', overflow: 'hidden'
      }}>
        <Box sx={{ position:'absolute', top:-60, right:-60, width:180, height:180, borderRadius:'50%', bgcolor:'rgba(255,255,255,0.06)' }} />
        <Box sx={{ position:'absolute', bottom:-40, left:'30%', width:140, height:140, borderRadius:'50%', bgcolor:'rgba(255,255,255,0.04)' }} />
        <Box sx={{ position:'relative', zIndex:1, display:'flex', alignItems:'center', gap:3 }}>
          <Avatar sx={{ width:56, height:56, bgcolor:'rgba(255,255,255,0.15)' }}>
            <MenuBook sx={{ fontSize:30, color:'#fff' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>Teacher Dashboard</Typography>
            <Typography variant="body2" sx={{ opacity:0.75, mt:0.3 }}>
              {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ---- Stat cards ---- */}
      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        {statCards.map((s, i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{
              background: s.grad, color:'#fff', borderRadius:3,
              boxShadow:'0 6px 20px rgba(0,0,0,0.18)',
              transition:'transform .25s',
              '&:hover':{ transform:'translateY(-4px)' }
            }}>
              <CardContent sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', p:'18px 22px' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity:0.85 }}>{s.label}</Typography>
                  <Typography variant="h3" fontWeight={700} sx={{ lineHeight:1.2 }}>{s.value}</Typography>
                </Box>
                <Box sx={{ opacity:0.85 }}>{s.icon}</Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ---- Chart + Classes list ---- */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p:3, borderRadius:3, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb:2 }}>Students per Class</Typography>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={chartData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize:13 }} />
                <YAxis tick={{ fontSize:13 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius:8, border:'none', boxShadow:'0 4px 12px rgba(0,0,0,0.12)' }}
                  formatter={(v) => [v, 'Students']}
                />
                <Bar dataKey="students" radius={[6,6,0,0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper sx={{ p:3, borderRadius:3, boxShadow:'0 2px 12px rgba(0,0,0,0.08)', height:'100%' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb:2 }}>My Classes</Typography>
            <Box sx={{ maxHeight:240, overflowY:'auto', pr:1 }}>
              {classes.map((c, i) => (
                <Box key={c.class_id} sx={{
                  display:'flex', justifyContent:'space-between', alignItems:'center',
                  p:'10px 14px', mb:1, borderRadius:2,
                  borderLeft:`4px solid ${COLORS[i % COLORS.length]}`,
                  bgcolor:'#f8fafc',
                  '&:hover':{ bgcolor:'#eef2ff' }
                }}>
                  <Box>
                    <Typography variant="body1" fontWeight={600}>Class {c.class_level} - {c.division}</Typography>
                    <Typography variant="caption" color="text.secondary">{c.year_name}</Typography>
                  </Box>
                  <Chip label={`${c.student_count} students`} size="small" sx={{ bgcolor: COLORS[i % COLORS.length], color:'#fff', fontWeight:600 }} />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ---- Subjects grid ---- */}
      <Paper sx={{ p:3, borderRadius:3, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb:2 }}>Subjects I Teach</Typography>
        <Grid container spacing={2}>
          {subjects.map((s, i) => (
            <Grid item xs={12} sm={6} md={4} key={s.subject_id}>
              <Box sx={{
                p:2, borderRadius:2, border:'1px solid #e2e8f0',
                display:'flex', alignItems:'center', gap:2,
                transition:'all .25s',
                '&:hover':{ borderColor: COLORS[i % COLORS.length], boxShadow:`0 2px 8px ${COLORS[i % COLORS.length]}33` }
              }}>
                <Box sx={{ width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', bgcolor: COLORS[i % COLORS.length] + '20' }}>
                  <MenuBook sx={{ color: COLORS[i % COLORS.length], fontSize:20 }} />
                </Box>
                <Box>
                  <Typography variant="body1" fontWeight={600}>{s.subject_name}</Typography>
                  <Typography variant="caption" color="text.secondary">Class {s.class_level}-{s.division}</Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>
    </Box>
  )
}

export default TeacherDashboard