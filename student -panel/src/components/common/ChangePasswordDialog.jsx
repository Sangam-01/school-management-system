import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
  InputAdornment
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import api from '../../api/axios'
import toast from 'react-hot-toast'

export default function ChangePasswordDialog({
  open,
  onClose,
  apiPath // e.g. "/teacher/change-password"
}) {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const [show, setShow] = useState(false)

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      return toast.error('All fields are required')
    }

    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match')
    }

    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }

    try {
      setLoading(true)
      const res = await api.put(apiPath, {
        old_password: oldPassword,
        new_password: newPassword
      })

      if (res.data.status === 'success') {
        toast.success('Password changed successfully')
        onClose()
        setOldPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(res.data.message)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Change Password</DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        <TextField
          fullWidth
          label="Old Password"
          type={show ? 'text' : 'password'}
          margin="normal"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShow(!show)}>
                  {show ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />

        <TextField
          fullWidth
          label="New Password"
          type="password"
          margin="normal"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />

        <TextField
          fullWidth
          label="Confirm New Password"
          type="password"
          margin="normal"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
        />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Change Password'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
