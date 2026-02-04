import { useState, useEffect } from 'react'
import {
  Box, Grid, Card, CardContent, Typography, Paper, Avatar,
  TextField, Button, Divider, InputAdornment
} from '@mui/material'
import { Edit, Save, Cancel, Person, Lock, Visibility, VisibilityOff } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/constants'

const TeacherProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [updating, setUpdating] = useState(false)

  // password section
  const [oldPass, setOldPass] = useState('')
  const [newPass, setNewPass] = useState(''  )
  const [confirmPass, setConfirmPass] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [changingPass, setChangingPass] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => { fetchProfile() }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true); setError(null)
      const res = await api.get('/teacher/profile')
      if (res.data.status === 'success') { setProfile(res.data.data); reset(res.data.data) }
      else setError(res.data.message)
    } catch (e) { setError(e.response?.data?.message || 'Failed to load'); toast.error('Failed to load profile') }
    finally { setLoading(false) }
  }

  const onSubmit = async (data) => {
    try {
      setUpdating(true)
      const res = await api.put('/teacher/profile/update', {
        fname: data.fname, lname: data.lname, gender: data.gender, mobile: data.mobile, email: data.email
      })
      if (res.data.status === 'success') { toast.success('Profile updated'); setEditing(false); fetchProfile() }
      else toast.error(res.data.message)
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to update') }
    finally { setUpdating(false) }
  }

  const handleChangePassword = async () => {
    if (!oldPass || !newPass) return toast.error('Enter old and new password')
    if (newPass !== confirmPass) return toast.error('Passwords do not match')
    if (newPass.length < 6) return toast.error('Password must be at least 6 characters')
    try {
      setChangingPass(true)
      const res = await api.put('/teacher/change-password', { old_password: oldPass, new_password: newPass })
      if (res.data.status === 'success') {
        toast.success('Password changed successfully')
        setOldPass(''); setNewPass(''); setConfirmPass('')
      } else toast.error(res.data.message)
    } catch (e) { toast.error(e.response?.data?.message || 'Failed') }
    finally { setChangingPass(false) }
  }

  if (loading) return <LoadingSpinner message="Loading profile..." />
  if (error) return <ErrorMessage error={error} onRetry={fetchProfile} />
  if (!profile) return null

  return (
    <Box>
      {/* Header */}
      <Box sx={{
        background:'linear-gradient(135deg,#1e1b4b,#312e81)', borderRadius:3, p:'24px 28px', mb:3,
        color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center'
      }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:2.5 }}>
          <Avatar sx={{ width:52, height:52, bgcolor:'rgba(255,255,255,0.15)', fontSize:22 }}>
            {profile.fname?.[0]}{profile.lname?.[0]}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight={700}>My Profile</Typography>
            <Typography variant="body2" sx={{ opacity:0.7 }}>Teacher · {profile.reg_no}</Typography>
          </Box>
        </Box>
        {!editing
          ? <Button variant="contained" startIcon={<Edit />} onClick={() => setEditing(true)} sx={{ bgcolor:'rgba(255,255,255,0.18)', color:'#fff', '&:hover':{ bgcolor:'rgba(255,255,255,0.28)' } }}>Edit</Button>
          : <Box sx={{ display:'flex', gap:1 }}>
              <Button variant="outlined" startIcon={<Cancel />} onClick={() => { setEditing(false); reset(profile) }} disabled={updating} sx={{ borderColor:'#fff', color:'#fff', '&:hover':{ bgcolor:'rgba(255,255,255,0.1)' } }}>Cancel</Button>
              <Button variant="contained" startIcon={<Save />} onClick={handleSubmit(onSubmit)} disabled={updating} sx={{ bgcolor:'#fff', color:'#312e81', fontWeight:600, '&:hover':{ bgcolor:'#e0e7ff' } }}>{updating ? 'Saving…' : 'Save'}</Button>
            </Box>
        }
      </Box>

      <Grid container spacing={3}>
        {/* Left – card summary */}
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius:3, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ textAlign:'center', pt:4, pb:3 }}>
              <Avatar sx={{ width:120, height:120, mx:'auto', mb:2, bgcolor:'#6366f1', fontSize:44 }}>
                {profile.fname?.[0]}{profile.lname?.[0]}
              </Avatar>
              <Typography variant="h5" fontWeight={600}>{profile.fname} {profile.lname}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt:0.5 }}>Teacher · {profile.reg_no}</Typography>

              <Divider sx={{ my:2.5 }} />
              {[
                { label:'Joining Date', value: formatDate(profile.joining_date) },
                { label:'Salary', value: profile.salary ? `₹${parseFloat(profile.salary).toLocaleString('en-IN')}` : '—' },
                { label:'Username', value: profile.username }
              ].map(item => (
                <Box key={item.label} sx={{ display:'flex', justifyContent:'space-between', py:0.8 }}>
                  <Typography variant="body2" color="text.secondary">{item.label}</Typography>
                  <Typography variant="body2" fontWeight={600}>{item.value}</Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Right – editable fields */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p:3, borderRadius:3, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb:2 }}>Personal Information</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="First Name" {...register('fname', { required:'Required' })} error={!!errors.fname} helperText={errors.fname?.message} disabled={!editing} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Last Name" {...register('lname')} disabled={!editing} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Gender" select SelectProps={{ native:true }} {...register('gender')} disabled={!editing}>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField fullWidth label="Mobile" {...register('mobile', { pattern:{ value:/^[0-9]{10}$/, message:'10-digit number' } })} error={!!errors.mobile} helperText={errors.mobile?.message} disabled={!editing} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Email" type="email" {...register('email', { pattern:{ value:/^[^\s@]+@[^\s@]+\.[^\s@]+$/, message:'Invalid email' } })} error={!!errors.email} helperText={errors.email?.message} disabled={!editing} />
              </Grid>
            </Grid>
          </Paper>

          {/* Change Password */}
          <Paper sx={{ p:3, mt:3, borderRadius:3, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
            <Box sx={{ display:'flex', alignItems:'center', gap:1, mb:2 }}>
              <Lock sx={{ color:'#6366f1' }} />
              <Typography variant="h6" fontWeight={600}>Change Password</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Old Password" type={showOld ? 'text' : 'password'} value={oldPass} onChange={e => setOldPass(e.target.value)}
                  InputProps={{ endAdornment:<InputAdornment position="end"><button style={{ background:'none', border:'none', cursor:'pointer', padding:4 }} onClick={() => setShowOld(!showOld)}>{showOld ? <VisibilityOff sx={{ fontSize:20 }} /> : <Visibility sx={{ fontSize:20 }} />}</button></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="New Password" type={showNew ? 'text' : 'password'} value={newPass} onChange={e => setNewPass(e.target.value)}
                  InputProps={{ endAdornment:<InputAdornment position="end"><button style={{ background:'none', border:'none', cursor:'pointer', padding:4 }} onClick={() => setShowNew(!showNew)}>{showNew ? <VisibilityOff sx={{ fontSize:20 }} /> : <Visibility sx={{ fontSize:20 }} />}</button></InputAdornment> }} />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField fullWidth label="Confirm Password" type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" color="warning" onClick={handleChangePassword} disabled={changingPass} sx={{ mt:1 }}>
                  {changingPass ? 'Updating…' : 'Update Password'}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default TeacherProfile