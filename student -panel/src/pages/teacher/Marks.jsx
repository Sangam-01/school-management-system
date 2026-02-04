import { useState, useEffect, useMemo } from 'react'
import {
  Box, Grid, Paper, Typography, TextField, Button, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, Avatar,
  MenuItem, Select, FormControl, InputLabel, CircularProgress, Alert
} from '@mui/material'
import { Save, Assessment } from '@mui/icons-material'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

/* grade colour map */
const GRADE_COLOR = { 'A+':'#10b981','A':'#3b82f6','B':'#8b5cf6','C':'#f59e0b','D':'#f97316','F':'#ef4444' }

function calcGrade(obtained, max) {
  if (!max || max === 0) return '—'
  const p = (obtained / max) * 100
  if (p >= 90) return 'A+'
  if (p >= 80) return 'A'
  if (p >= 70) return 'B'
  if (p >= 60) return 'C'
  if (p >= 40) return 'D'
  return 'F'
}

const TeacherMarks = () => {
  const [classes, setClasses]     = useState([])
  const [subjects, setSubjects]   = useState([])
  const [selectedClass, setClass] = useState('')
  const [selectedSubject, setSubject] = useState('')
  const [examName, setExamName]   = useState('')
  const [maxMarks, setMaxMarks]   = useState('')
  const [students, setStudents]   = useState([])
  const [marks, setMarks]         = useState({}) // enrollment_id → number|''
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)

  // load classes + subjects once
  useEffect(() => {
    Promise.all([
      api.get('/teacher/classes'),
      api.get('/teacher/subjects')
    ]).then(([cR, sR]) => {
      if (cR.data.status === 'success') { setClasses(cR.data.data); if (cR.data.data.length) setClass(cR.data.data[0].class_id) }
      if (sR.data.status === 'success') setSubjects(sR.data.data)
    }).catch(() => toast.error('Failed to load'))
    .finally(() => setLoading(false))
  }, [])

  // filter subjects by selected class
  const filteredSubjects = useMemo(() => subjects.filter(s => s.class_id === selectedClass || s.class_id === Number(selectedClass)), [subjects, selectedClass])

  // when class changes → reset subject, load students
  useEffect(() => {
    if (!selectedClass) return
    setSubject('')
    api.get('/teacher/class/students', { params: { class_id: selectedClass } })
      .then(r => { if (r.data.status === 'success') { setStudents(r.data.data); const m = {}; r.data.data.forEach(s => m[s.enrollment_id] = ''); setMarks(m) } })
      .catch(() => toast.error('Failed to load students'))
  }, [selectedClass])

  // when subject changes → auto-set first as default
  useEffect(() => { if (filteredSubjects.length && !selectedSubject) setSubject(filteredSubjects[0].subject_id) }, [filteredSubjects])

  const handleMarkChange = (eid, val) => {
    // allow only numbers ≤ maxMarks
    if (val !== '' && (isNaN(val) || Number(val) < 0)) return
    if (maxMarks && Number(val) > Number(maxMarks)) return
    setMarks(prev => ({ ...prev, [eid]: val }))
  }

  const handleSave = async () => {
    if (!selectedSubject) return toast.error('Select a subject')
    if (!examName.trim()) return toast.error('Enter exam name')
    if (!maxMarks || Number(maxMarks) <= 0) return toast.error('Enter max marks')

    const marksArr = students.map(s => ({
      enrollment_id: s.enrollment_id,
      marks_obtained: marks[s.enrollment_id] === '' ? 0 : Number(marks[s.enrollment_id])
    }))

    try {
      setSaving(true)
      const res = await api.post('/teacher/marks/add', {
        subject_id: Number(selectedSubject),
        exam_name: examName.trim(),
        max_marks: Number(maxMarks),
        marks: marksArr
      })
      if (res.data.status === 'success') toast.success('Marks saved successfully')
      else toast.error(res.data.message)
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  if (loading) return <LoadingSpinner message="Loading…" />

  return (
    <Box>
      {/* Header */}
      <Box sx={{ background:'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius:3, p:'24px 28px', mb:3, color:'#fff' }}>
        <Typography variant="h4" fontWeight={700}>Add Marks</Typography>
        <Typography variant="body2" sx={{ opacity:0.7, mt:0.3 }}>Select class, subject & exam · Enter marks · Auto-grade calculated</Typography>
      </Box>

      {/* Filter row */}
      <Paper sx={{ p:2.5, borderRadius:3, mb:3, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Class</InputLabel>
              <Select value={selectedClass} label="Class" onChange={e => setClass(e.target.value)}>
                {classes.map(c => <MenuItem key={c.class_id} value={c.class_id}>Class {c.class_level}-{c.division}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Subject</InputLabel>
              <Select value={selectedSubject} label="Subject" onChange={e => setSubject(e.target.value)}>
                {filteredSubjects.map(s => <MenuItem key={s.subject_id} value={s.subject_id}>{s.subject_name}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth label="Exam Name" value={examName} onChange={e => setExamName(e.target.value)} placeholder="e.g. Mid-Term" />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField fullWidth label="Max Marks" type="number" value={maxMarks} onChange={e => setMaxMarks(e.target.value)} inputProps={{ min:1 }} />
          </Grid>
        </Grid>
      </Paper>

      {/* quick-fill helpers */}
      {students.length > 0 && maxMarks && (
        <Box sx={{ display:'flex', gap:1.5, mb:2, flexWrap:'wrap' }}>
          <Button size="small" variant="outlined" onClick={() => { const m = {}; students.forEach(s => m[s.enrollment_id] = maxMarks); setMarks(m) }}>Fill All → {maxMarks}</Button>
          <Button size="small" variant="outlined" onClick={() => { const m = {}; students.forEach(s => m[s.enrollment_id] = '0'); setMarks(m) }}>Fill All → 0</Button>
          <Button size="small" variant="outlined" onClick={() => { const m = {}; students.forEach(s => m[s.enrollment_id] = ''); setMarks(m) }}>Clear All</Button>
        </Box>
      )}

      {/* Table */}
      <Paper sx={{ borderRadius:3, boxShadow:'0 2px 12px rgba(0,0,0,0.08)', overflow:'hidden' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow sx={{ bgcolor:'#f1f5f9' }}>
                <TableCell sx={{ fontWeight:600, width:50 }}>#</TableCell>
                <TableCell sx={{ fontWeight:600 }}>Student</TableCell>
                <TableCell sx={{ fontWeight:600, width:90 }}>Roll</TableCell>
                <TableCell sx={{ fontWeight:600, width:130 }}>Marks {maxMarks ? `/ ${maxMarks}` : ''}</TableCell>
                <TableCell sx={{ fontWeight:600, width:100 }}>Grade</TableCell>
                <TableCell sx={{ fontWeight:600, width:90 }}>%</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.map((s, i) => {
                const val = marks[s.enrollment_id]
                const grade = maxMarks ? calcGrade(Number(val) || 0, Number(maxMarks)) : '—'
                const pct = maxMarks ? ((Number(val) || 0) / Number(maxMarks) * 100).toFixed(1) : '—'
                return (
                  <TableRow key={s.enrollment_id} sx={{ '&:hover':{ bgcolor:'#f8fafc' } }}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ display:'flex', alignItems:'center', gap:1.2 }}>
                        <Avatar sx={{ width:32, height:32, bgcolor:'#6366f1', fontSize:13 }}>{s.fname?.[0]}{s.lname?.[0]}</Avatar>
                        <Typography variant="body2" fontWeight={600}>{s.fname} {s.lname}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{s.roll_no}</TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        type="number"
                        value={val}
                        onChange={e => handleMarkChange(s.enrollment_id, e.target.value)}
                        inputProps={{ min:0, max: maxMarks || undefined }}
                        sx={{ width:100 }}
                      />
                    </TableCell>
                    <TableCell>
                      {grade !== '—' && (
                        <Chip label={grade} size="small" sx={{ bgcolor: GRADE_COLOR[grade] || '#9ca3af', color:'#fff', fontWeight:700, minWidth:42 }} />
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color={Number(pct) >= 40 ? 'success.main' : 'error.main'}>{pct === '—' ? '—' : `${pct}%`}</Typography>
                    </TableCell>
                  </TableRow>
                )
              })}
              {!students.length && <TableRow><TableCell colSpan={6} sx={{ textAlign:'center', py:4, color:'text.secondary' }}>No students</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Save */}
      {students.length > 0 && (
        <Box sx={{ mt:3, display:'flex', justifyContent:'flex-end' }}>
          <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={saving} sx={{
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)', color:'#fff', fontWeight:600, px:4, py:1.2
          }}>
            {saving ? 'Saving…' : 'Save Marks'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default TeacherMarks