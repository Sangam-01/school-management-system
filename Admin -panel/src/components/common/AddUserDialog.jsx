import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    MenuItem,
  } from '@mui/material'
  import { useState } from 'react'
  import api from '../../api/axios'
  
  const AddUserDialog = ({ open, onClose, role, onSuccess }) => {
    const [form, setForm] = useState({
      fname: '',
      reg_no: '',
      salary: '',
      date: '',
    })
  
    const submit = () => {
      api.post('/auth/registration', {
        fname: form.fname,
        reg_no: form.reg_no,
        role,
        salary: role !== 'student' ? form.salary : undefined,
        date: form.date,
      }).then(() => {
        onSuccess()
        onClose()
      })
    }
  
    return (
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Add {role}</DialogTitle>
        <DialogContent>
          <TextField
            label="Full Name"
            fullWidth
            margin="normal"
            onChange={e => setForm({ ...form, fname: e.target.value })}
          />
          <TextField
            label="Reg No (Username)"
            fullWidth
            margin="normal"
            onChange={e => setForm({ ...form, reg_no: e.target.value })}
          />
          <TextField
            type="date"
            fullWidth
            margin="normal"
            onChange={e => setForm({ ...form, date: e.target.value })}
          />
          {role !== 'student' && (
            <TextField
              label="Salary"
              type="number"
              fullWidth
              margin="normal"
              onChange={e =>
                setForm({ ...form, salary: e.target.value })
              }
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="contained" onClick={submit}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
  
  export default AddUserDialog
  