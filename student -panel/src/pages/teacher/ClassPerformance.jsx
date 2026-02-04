import { useState, useEffect } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Paper, Avatar,
  Chip, LinearProgress, TextField, MenuItem, CircularProgress
} from '@mui/material'
import { TrendingUp, EmojiEvents, Assessment, People, Star } from '@mui/icons-material'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import toast from 'react-hot-toast'

/* ───────── helpers ───────── */
const fmt = (n) => (parseFloat(n) || 0).toFixed(2)

const getGrade = (pct) => {
  const p = parseFloat(pct)
  if (p >= 90) return 'A+'
  if (p >= 80) return 'A'
  if (p >= 70) return 'B'
  if (p >= 60) return 'C'
  if (p >= 40) return 'D'
  return 'F'
}

const gradeChipColor = (pct) => {
  const p = parseFloat(pct)
  if (p >= 80) return 'success'
  if (p >= 60) return 'info'
  if (p >= 40) return 'warning'
  return 'error'
}

const progressBarColor = (pct) => {
  const p = parseFloat(pct)
  if (p >= 80) return '#10b981'
  if (p >= 60) return '#3b82f6'
  if (p >= 40) return '#f59e0b'
  return '#ef4444'
}

const PODIUM = [
  { bg:'linear-gradient(135deg,#f59e0b,#fcd34d)', shadow:'rgba(245,158,11,.45)', medal:'🥇' },
  { bg:'linear-gradient(135deg,#6b7280,#d1d5db)', shadow:'rgba(107,114,128,.4)',  medal:'🥈' },
  { bg:'linear-gradient(135deg,#92400e,#d97706)', shadow:'rgba(146,64,14,.4)',    medal:'🥉' },
]

const BAR_COLORS = ['#667eea','#764ba2','#f093fb','#11998e','#38ef7d','#fa709a','#fee140','#f5576c','#4facfe','#00f2fe']

/* ───────── component ───────── */
const ClassPerformance = () => {
  const [classes, setClasses]           = useState([])
  const [selectedClassId, setSelected]  = useState('')
  const [performance, setPerformance]   = useState([])
  const [topStudents, setTopStudents]   = useState([])
  const [loading, setLoading]           = useState(true)
  const [perfLoading, setPerfLoading]   = useState(false)
  const [error, setError]               = useState(null)

  useEffect(() => { fetchClasses() }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true); setError(null)
      const res = await api.get('/teacher/classes')
      if (res.data.status === 'success') {
        const list = res.data.data
        setClasses(list)
        // auto-select when only one class
        if (list.length === 1) setSelected(list[0].class_id)
      }
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load classes')
      toast.error('Failed to load classes')
    } finally { setLoading(false) }
  }

  // fetch perf + top whenever class changes
  useEffect(() => {
    if (selectedClassId) fetchPerformance(selectedClassId)
  }, [selectedClassId])

  const fetchPerformance = async (classId) => {
    try {
      setPerfLoading(true)
      const [perfRes, topRes] = await Promise.all([
        api.get('/teacher/class/performance',  { params: { class_id: classId } }),
        api.get('/teacher/class/top-students', { params: { class_id: classId, limit: 3 } })
      ])
      if (perfRes.data.status === 'success') setPerformance(perfRes.data.data)
      if (topRes.data.status === 'success')  setTopStudents(topRes.data.data)
    } catch (e) {
      toast.error('Failed to load performance data')
    } finally { setPerfLoading(false) }
  }

  if (loading) return <LoadingSpinner message="Loading…" />
  if (error)   return <ErrorMessage error={error} onRetry={fetchClasses} />

  /* derived */
  const total    = performance.length
  const avgPct   = total ? performance.reduce((s, st) => s + parseFloat(st.percentage || 0), 0) / total : 0
  const passed   = performance.filter(st => parseFloat(st.percentage) >= 40).length
  const passRate = total ? (passed / total) * 100 : 0
  const highest  = total ? Math.max(...performance.map(st => parseFloat(st.percentage))) : 0
  const lowest   = total ? Math.min(...performance.map(st => parseFloat(st.percentage))) : 0

  /* chart data */
  const barData = performance.map(st => ({
    name: st.student_name.split(' ')[0],
    pct:  parseFloat(st.percentage)
  }))

  const gradeDist = ['A+','A','B','C','D','F'].map(g => ({
    grade: g,
    count: performance.filter(st => getGrade(st.percentage) === g).length
  }))

  /* ──── render ──── */
  return (
    <Box className="fade-in">

      {/* header */}
      <Box sx={{
        background:'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
        borderRadius:3, p:3, mb:3, color:'#fff',
        position:'relative', overflow:'hidden'
      }}>
        <Box sx={{ position:'absolute', top:-50, right:-50, width:160, height:160, borderRadius:'50%', bgcolor:'rgba(255,255,255,.1)' }} />
        <Box sx={{ position:'relative', zIndex:1 }}>
          <Typography variant="h4" fontWeight={700}>Class Performance</Typography>
          <Typography variant="body1" sx={{ opacity:.85, mt:.3 }}>Analytics and rankings for your class</Typography>
        </Box>
      </Box>

      {/* class selector */}
      <Paper sx={{ p:2.5, mb:3, borderRadius:3, boxShadow:'0 4px 20px rgba(0,0,0,.08)' }}>
        <TextField
          select fullWidth label="Select Class"
          value={selectedClassId}
          onChange={e => setSelected(e.target.value)}
          sx={{ maxWidth:380 }}
        >
          {classes.map(c => (
            <MenuItem key={c.class_id} value={c.class_id}>
              Class {c.class_level} – {c.division} &nbsp;· {c.student_count} students
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {/* empty – nothing selected */}
      {!selectedClassId && (
        <Paper sx={{ p:8, textAlign:'center', borderRadius:3 }}>
          <Assessment sx={{ fontSize:70, color:'text.secondary' }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt:1 }}>Select a class above to view performance</Typography>
        </Paper>
      )}

      {/* spinner */}
      {selectedClassId && perfLoading && (
        <Box sx={{ display:'flex', justifyContent:'center', py:8 }}>
          <CircularProgress size={48} />
        </Box>
      )}

      {/* empty – no marks yet */}
      {selectedClassId && !perfLoading && performance.length === 0 && (
        <Paper sx={{ p:8, textAlign:'center', borderRadius:3 }}>
          <Assessment sx={{ fontSize:70, color:'text.secondary' }} />
          <Typography variant="h6" color="text.secondary" sx={{ mt:1 }}>No marks recorded yet for this class</Typography>
        </Paper>
      )}

      {/* ═══════ MAIN BODY ═══════ */}
      {selectedClassId && !perfLoading && performance.length > 0 && (
        <>
          {/* 4 stat cards */}
          <Grid container spacing={2.5} sx={{ mb:3 }}>
            {[
              { icon:People,      val:total,                   label:'Total Students',  grad:'linear-gradient(135deg,#667eea,#764ba2)', sh:'rgba(102,126,234,.35)' },
              { icon:TrendingUp,  val:`${fmt(avgPct)}%`,      label:'Class Average',   grad:'linear-gradient(135deg,#11998e,#38ef7d)', sh:'rgba(56,239,125,.35)' },
              { icon:EmojiEvents, val:`${passed} / ${total}`, label:'Students Passed', grad:'linear-gradient(135deg,#f093fb,#f5576c)', sh:'rgba(245,87,108,.35)' },
              { icon:Star,        val:`${fmt(passRate)}%`,    label:'Pass Rate',       grad:'linear-gradient(135deg,#fa709a,#fee140)', sh:'rgba(250,112,154,.35)' },
            ].map(({ icon:Icon, val, label, grad, sh }) => (
              <Grid item xs={12} sm={6} md={3} key={label}>
                <Card sx={{ background:grad, color:'#fff', borderRadius:3, boxShadow:`0 8px 24px ${sh}`, transition:'transform .25s', '&:hover':{ transform:'translateY(-5px)' } }}>
                  <CardContent>
                    <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <Box>
                        <Typography variant="body2" sx={{ opacity:.85 }}>{label}</Typography>
                        <Typography variant="h3" fontWeight={700}>{val}</Typography>
                      </Box>
                      <Avatar sx={{ bgcolor:'rgba(255,255,255,.2)', width:52, height:52 }}>
                        <Icon sx={{ fontSize:26 }} />
                      </Avatar>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* highest / lowest / spread */}
          <Paper sx={{ p:1.8, mb:3, borderRadius:3, boxShadow:'0 4px 20px rgba(0,0,0,.08)', display:'flex', gap:3, flexWrap:'wrap', alignItems:'center' }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:.8 }}>
              <Chip label="Highest" color="success" size="small" sx={{ fontWeight:600 }} />
              <Typography variant="body2" fontWeight={700}>{fmt(highest)}%</Typography>
            </Box>
            <Box sx={{ display:'flex', alignItems:'center', gap:.8 }}>
              <Chip label="Lowest" color="error" size="small" sx={{ fontWeight:600 }} />
              <Typography variant="body2" fontWeight={700}>{fmt(lowest)}%</Typography>
            </Box>
            <Box sx={{ display:'flex', alignItems:'center', gap:.8 }}>
              <Chip label="Spread" variant="outlined" size="small" sx={{ fontWeight:600 }} />
              <Typography variant="body2" fontWeight={700}>{fmt(highest - lowest)}%</Typography>
            </Box>
          </Paper>

          {/* top-3 podium */}
          {topStudents.length > 0 && (
            <Paper sx={{ p:3, mb:3, borderRadius:3, boxShadow:'0 4px 20px rgba(0,0,0,.08)', background:'linear-gradient(135deg,#fef3c7,#fde68a)' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom>🏆 Top Performers</Typography>
              <Grid container spacing={2}>
                {topStudents.slice(0,3).map((st, i) => (
                  <Grid item xs={12} sm={4} key={st.enrollment_id}>
                    <Card sx={{ background:PODIUM[i].bg, color:'#fff', borderRadius:3, boxShadow:`0 6px 18px ${PODIUM[i].shadow}` }}>
                      <CardContent>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1.5, mb:1.5 }}>
                          <Avatar sx={{ width:48, height:48, bgcolor:'rgba(255,255,255,.25)', fontSize:'1.4rem', fontWeight:700 }}>
                            {PODIUM[i].medal}
                          </Avatar>
                          <Box>
                            <Typography variant="h6" fontWeight={700}>{st.student_name}</Typography>
                            <Typography variant="caption" sx={{ opacity:.85 }}>Roll: {st.roll_no}</Typography>
                          </Box>
                        </Box>
                        <Box sx={{ display:'flex', justifyContent:'space-between' }}>
                          <Box>
                            <Typography variant="caption" sx={{ opacity:.8 }}>Score</Typography>
                            <Typography variant="h5" fontWeight={700}>{fmt(st.percentage)}%</Typography>
                          </Box>
                          <Box sx={{ textAlign:'right' }}>
                            <Typography variant="caption" sx={{ opacity:.8 }}>Marks</Typography>
                            <Typography variant="body1" fontWeight={600}>{st.total_marks_obtained} / {st.total_max_marks}</Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* charts row */}
          <Grid container spacing={3} sx={{ mb:3 }}>
            {/* bar – score per student */}
            <Grid item xs={12} md={7}>
              <Paper sx={{ p:3, borderRadius:3, boxShadow:'0 4px 20px rgba(0,0,0,.08)', height:'100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>📊 Score Distribution</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData} margin={{ top:5, right:10, left:-10, bottom:30 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="name" tick={{ fontSize:12 }} interval={0} angle={-35} textAnchor="end" />
                    <YAxis domain={[0,100]} unit="%" tick={{ fontSize:12 }} />
                    <Tooltip formatter={(v) => [`${v}%`,'Percentage']} contentStyle={{ borderRadius:8, border:'none', boxShadow:'0 4px 12px rgba(0,0,0,.1)' }} />
                    <Bar dataKey="pct" radius={[5,5,0,0]}>
                      {barData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* line – grade buckets */}
            <Grid item xs={12} md={5}>
              <Paper sx={{ p:3, borderRadius:3, boxShadow:'0 4px 20px rgba(0,0,0,.08)', height:'100%' }}>
                <Typography variant="h6" fontWeight={600} gutterBottom>📈 Grade Distribution</Typography>
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={gradeDist} margin={{ top:5, right:10, left:-10, bottom:5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="grade" tick={{ fontSize:13 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize:12 }} />
                    <Tooltip contentStyle={{ borderRadius:8, border:'none', boxShadow:'0 4px 12px rgba(0,0,0,.1)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#764ba2" strokeWidth={3} dot={{ r:5, fill:'#764ba2' }} name="Students" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* full ranked table */}
          <Paper sx={{ p:3, borderRadius:3, boxShadow:'0 4px 20px rgba(0,0,0,.08)' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>📋 Complete Rankings</Typography>
            <Box sx={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', marginTop:4 }}>
                <thead>
                  <tr style={{ background:'#f3f4f6' }}>
                    {['Rank','Roll No','Name','Reg No','Subjects','Obtained','Out of','%','Grade','Progress'].map(h => (
                      <th key={h} style={{ padding:'10px 14px', textAlign:'left', fontSize:13, fontWeight:600, color:'#374151', borderBottom:'2px solid #e5e7eb', whiteSpace:'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* backend already ORDER BY percentage DESC */}
                  {performance.map((st, i) => {
                    const pct = parseFloat(st.percentage)
                    return (
                      <tr key={st.enrollment_id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={{ padding:'10px 14px' }}>
                          <Chip label={`#${i+1}`} size="small" sx={{ fontWeight:700, bgcolor: i===0?'#f59e0b': i===1?'#9ca3af': i===2?'#b45309':'#e5e7eb', color: i<3?'#fff':'#374151' }} />
                        </td>
                        <td style={{ padding:'10px 14px', fontWeight:600, fontSize:14 }}>{st.roll_no}</td>
                        <td style={{ padding:'10px 14px', fontWeight:600, fontSize:14 }}>{st.student_name}</td>
                        <td style={{ padding:'10px 14px', fontSize:13, color:'#6b7280' }}>{st.reg_no}</td>
                        <td style={{ padding:'10px 14px', fontSize:14, textAlign:'center' }}>{st.total_subjects}</td>
                        <td style={{ padding:'10px 14px', fontSize:14, fontWeight:600, color:'#667eea', textAlign:'center' }}>{st.total_marks_obtained}</td>
                        <td style={{ padding:'10px 14px', fontSize:14, textAlign:'center', color:'#6b7280' }}>{st.total_max_marks}</td>
                        <td style={{ padding:'10px 14px', fontSize:16, fontWeight:700, textAlign:'center' }}>{fmt(st.percentage)}%</td>
                        <td style={{ padding:'10px 14px', textAlign:'center' }}>
                          <Chip label={getGrade(st.percentage)} color={gradeChipColor(st.percentage)} size="small" sx={{ fontWeight:700 }} />
                        </td>
                        <td style={{ padding:'10px 14px', minWidth:130 }}>
                          <LinearProgress variant="determinate" value={pct>100?100:pct} sx={{ height:8, borderRadius:4, bgcolor:'#e5e7eb', '& .MuiLinearProgress-bar':{ borderRadius:4, bgcolor:progressBarColor(st.percentage) } }} />
                          <Typography variant="caption" color="text.secondary">{fmt(st.percentage)}%</Typography>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  )
}

export default ClassPerformance