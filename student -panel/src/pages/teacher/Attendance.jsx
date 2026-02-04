import { useState, useEffect } from 'react'
import {
  Box, Grid, Paper, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Avatar, MenuItem,
  Select, FormControl, InputLabel, Divider, CircularProgress
} from '@mui/material'
import { CheckCircle, Cancel, Save, RefreshOutlined } from '@mui/icons-material'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import toast from 'react-hot-toast'

const today = () => new Date().toISOString().split('T')[0]

const TeacherAttendance = () => {
  const [classes, setClasses] = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [date, setDate] = useState(today())
  const [students, setStudents] = useState([])   // full list
  const [attendance, setAttendance] = useState({}) // enrollment_id → 'Present'|'Absent'
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false) // whether today's record already exists

  // 1. load classes once
  useEffect(() => {
    api.get('/teacher/classes').then(res => {
      if (res.data.status === 'success') {
        setClasses(res.data.data)
        if (res.data.data.length) setSelectedClass(res.data.data[0].class_id)
      }
    }).catch(() => toast.error('Failed to load classes'))
    .finally(() => setLoading(false))
  }, [])

  // 2. when class or date changes → load students + existing attendance
  useEffect(() => {
    if (!selectedClass) return
    loadStudentsAndAttendance()
  }, [selectedClass, date])

  const loadStudentsAndAttendance = async () => {
    try {
      setLoading(true)
      const [sRes, aRes] = await Promise.all([
        api.get('/teacher/class/students', { params: { class_id: selectedClass } }),
        api.get('/teacher/attendance', { params: { class_id: selectedClass, date } })
      ])
      const studentList = sRes.data.status === 'success' ? sRes.data.data : []
      setStudents(studentList)

      // build map from existing attendance
      const map = {}
      let hasSaved = false
      if (aRes.data.status === 'success' && aRes.data.data.length) {
        hasSaved = true
        aRes.data.data.forEach(a => { map[a.enrollment_id] = a.status })
      }
      // default everyone to Present if no record exists
      studentList.forEach(s => { if (!map[s.enrollment_id]) map[s.enrollment_id] = 'Present' })
      setAttendance(map)
      setSaved(hasSaved)
    } catch (e) { toast.error('Failed to load') }
    finally { setLoading(false) }
  }

  const toggle = (eid) => {
    setSaved(false)
    setAttendance(prev => ({ ...prev, [eid]: prev[eid] === 'Present' ? 'Absent' : 'Present' }))
  }

  const markAll = (status) => {
    setSaved(false)
    const map = {}
    students.forEach(s => { map[s.enrollment_id] = status })
    setAttendance(map)
  }

  const handleSave = async () => {
    const payload = students.map(s => ({ enrollment_id: s.enrollment_id, status: attendance[s.enrollment_id] || 'Present' }))
    try {
      setSaving(true)
      const res = await api.post('/teacher/attendance/mark', { attendance_date: date, students: payload })
      if (res.data.status === 'success') { toast.success('Attendance saved'); setSaved(true) }
      else toast.error(res.data.message)
    } catch (e) { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  if (loading && !classes.length) return <LoadingSpinner message="Loading…" />

  const presentCount = Object.values(attendance).filter(v => v === 'Present').length
  const absentCount = students.length - presentCount

  return (
    <Box>
      {/* Header */}
      <Box sx={{ background:'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius:3, p:'24px 28px', mb:3, color:'#fff' }}>
        <Typography variant="h4" fontWeight={700}>Mark Attendance</Typography>
        <Typography variant="body2" sx={{ opacity:0.7, mt:0.3 }}>Select class & date, toggle status, then save</Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p:2.5, borderRadius:3, mb:3, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select value={selectedClass} label="Class" onChange={e => setSelectedClass(e.target.value)}>
                {classes.map(c => <MenuItem key={c.class_id} value={c.class_id}>Class {c.class_level} - {c.division}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField fullWidth label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} InputLabelProps={{ shrink:true }} />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display:'flex', gap:1 }}>
              <Button variant="outlined" size="small" onClick={() => markAll('Present')} sx={{ flex:1, color:'#10b981', borderColor:'#10b981' }}>All Present</Button>
              <Button variant="outlined" size="small" onClick={() => markAll('Absent')} sx={{ flex:1, color:'#ef4444', borderColor:'#ef4444' }}>All Absent</Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Summary chips */}
      <Box sx={{ display:'flex', gap:2, mb:2, flexWrap:'wrap', alignItems:'center' }}>
        <Chip label={`Total: ${students.length}`} variant="outlined" />
        <Chip label={`Present: ${presentCount}`} sx={{ bgcolor:'#d1fae5', color:'#065f46', fontWeight:600 }} />
        <Chip label={`Absent: ${absentCount}`} sx={{ bgcolor:'#fee2e2', color:'#991b1b', fontWeight:600 }} />
        {saved && <Chip label="✓ Saved" color="success" variant="outlined" />}
      </Box>

      {/* Table */}
      {loading ? <CircularProgress sx={{ display:'block', mx:'auto', my:4 }} /> : (
        <Paper sx={{ borderRadius:3, boxShadow:'0 2px 12px rgba(0,0,0,0.08)', overflow:'hidden' }}>
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor:'#f1f5f9' }}>
                  <TableCell sx={{ fontWeight:600, width:60 }}>#</TableCell>
                  <TableCell sx={{ fontWeight:600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight:600 }}>Roll No</TableCell>
                  <TableCell sx={{ fontWeight:600 }}>Reg No</TableCell>
                  <TableCell sx={{ fontWeight:600, width:140 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((s, i) => {
                  const isPresent = attendance[s.enrollment_id] === 'Present'
                  return (
                    <TableRow key={s.enrollment_id} sx={{ '&:hover':{ bgcolor:'#f8fafc' } }}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
                          <Avatar sx={{ width:34, height:34, bgcolor: isPresent ? '#10b981' : '#ef4444', fontSize:14 }}>
                            {s.fname?.[0]}{s.lname?.[0]}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>{s.fname} {s.lname}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{s.roll_no}</TableCell>
                      <TableCell>{s.reg_no}</TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => toggle(s.enrollment_id)}
                          startIcon={isPresent ? <CheckCircle sx={{ fontSize:16 }} /> : <Cancel sx={{ fontSize:16 }} />}
                          sx={{
                            bgcolor: isPresent ? '#10b981' : '#ef4444',
                            color:'#fff', minWidth:100, fontWeight:600,
                            '&:hover':{ bgcolor: isPresent ? '#059669' : '#dc2626' }
                          }}
                        >
                          {isPresent ? 'Present' : 'Absent'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {!students.length && (
                  <TableRow><TableCell colSpan={5} sx={{ textAlign:'center', py:4, color:'text.secondary' }}>No students found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Save button */}
      {students.length > 0 && (
        <Box sx={{ mt:3, display:'flex', justifyContent:'flex-end' }}>
          <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={saving || saved} sx={{
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', fontWeight:600, px:4, py:1.2,
            '&:disabled':{ opacity:0.55 }
          }}>
            {saving ? 'Saving…' : saved ? 'Already Saved' : 'Save Attendance'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default TeacherAttendance