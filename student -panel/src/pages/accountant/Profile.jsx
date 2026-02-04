import { useState, useEffect } from 'react'
import { Paper, Grid, TextField, Button, Typography, Box, Avatar, Card, CardContent } from '@mui/material'
import { Edit, Save, Cancel } from '@mui/icons-material'
import { useForm } from 'react-hook-form'
import api from '../../api/axios'
import LoadingSpinner from '../../components/common/LoadingSpinner'
import ErrorMessage from '../../components/common/ErrorMessage'
import toast from 'react-hot-toast'
import { formatDate } from '../../utils/constants'

const AccountantProfile = () => {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [editing, setEditing] = useState(false)
  const [updating, setUpdating] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get('/accountant/profile')
      
      if (response.data.status === 'success') {
        setProfile(response.data.data)
        reset(response.data.data)
      } else {
        setError(response.data.message)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile')
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = async (data) => {
    try {
      setUpdating(true)
      const response = await api.put('/accountant/profile/update', data)
      
      if (response.data.status === 'success') {
        toast.success('Profile updated successfully')
        setEditing(false)
        fetchProfile()
      } else {
        toast.error(response.data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile')
    } finally {
      setUpdating(false)
    }
  }

  const handleCancel = () => {
    reset(profile)
    setEditing(false)
  }

  if (loading) return <LoadingSpinner message="Loading profile..." />
  if (error) return <ErrorMessage error={error} onRetry={fetchProfile} />
  if (!profile) return null

  return (
    <Box className="fade-in">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          My Profile
        </Typography>
        {!editing ? (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSubmit(onSubmit)}
              disabled={updating}
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </Button>
          </Box>
        )}
      </Box>

      <Grid container spacing={3}>
        {/* Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={profile.image || undefined}
                sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
              />
              <Typography variant="h5" fontWeight={600}>
                {profile.fname} {profile.mname} {profile.lname}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profile.reg_no}
              </Typography>
              <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                Accountant
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Joined: {formatDate(profile.joining_date)}
              </Typography>
              {profile.salary && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Salary: ₹{parseFloat(profile.salary).toLocaleString('en-IN')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Details Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Personal Information
            </Typography>

            <form onSubmit={handleSubmit(onSubmit)}>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="First Name"
                    {...register('fname', { required: 'First name is required' })}
                    error={!!errors.fname}
                    helperText={errors.fname?.message}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Middle Name"
                    {...register('mname')}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    {...register('lname')}
                    disabled={!editing}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Gender"
                    select
                    SelectProps={{ native: true }}
                    {...register('gender')}
                    disabled={!editing}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Registration Number"
                    value={profile.reg_no}
                    disabled
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    {...register('email', {
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address'
                      }
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    disabled={!editing}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Mobile"
                    {...register('mobile', {
                      pattern: {
                        value: /^[0-9]{10}$/,
                        message: 'Invalid mobile number'
                      }
                    })}
                    error={!!errors.mobile}
                    helperText={errors.mobile?.message}
                    disabled={!editing}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Address"
                    multiline
                    rows={3}
                    {...register('address')}
                    disabled={!editing}
                  />
                </Grid>
              </Grid>
            </form>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default AccountantProfile