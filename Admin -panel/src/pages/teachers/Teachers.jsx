import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Switch,
  TextField,
  Typography,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import AddIcon from '@mui/icons-material/Add'
import { useEffect, useState } from 'react'
import api from '../../api/axios'
import AddUserDialog from '../../components/common/AddUserDialog'

const Teachers = () => {
  const [teachers, setTeachers] = useState([])
  const [openSalary, setOpenSalary] = useState(false)
  const [openAdd, setOpenAdd] = useState(false)

  const [salaryData, setSalaryData] = useState({
    employee_id: null,
    salary: '',
  })

  const loadTeachers = () => {
    api.get('/admin/teachers').then(res => {
      if (res.data.status === 'success') {
        setTeachers(res.data.data)
      }
    })
  }

  useEffect(() => {
    loadTeachers()
  }, [])

  const saveSalary = () => {
    api
      .put('/admin/teacher/update-salary', salaryData)
      .then(() => {
        setOpenSalary(false)
        loadTeachers()
      })
  }

  const toggleStatus = t => {
    api
      .put('/admin/teacher/change-status', {
        user_id: t.user_id,
        status: t.status === 'active' ? 'inactive' : 'active',
      })
      .then(loadTeachers)
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Teachers
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ mb: 2 }}
        onClick={() => setOpenAdd(true)}
      >
        Add Teacher
      </Button>

      <Grid container spacing={2}>
        {teachers.map(t => (
          <Grid item xs={12} md={4} key={t.employee_id}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6">
                  {t.fname} {t.lname}
                </Typography>

                <Typography color="text.secondary">
                  Salary: ₹{t.salary}
                </Typography>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mt: 2,
                  }}
                >
                  <IconButton
                    onClick={() => {
                      setSalaryData({
                        employee_id: t.employee_id,
                        salary: t.salary,
                      })
                      setOpenSalary(true)
                    }}
                  >
                    <EditIcon />
                  </IconButton>

                  <Switch
                    checked={t.status === 'active'}
                    onChange={() => toggleStatus(t)}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ADD TEACHER */}
      <AddUserDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        role="teacher"
        onSuccess={loadTeachers}
      />

      {/* SALARY DIALOG */}
      <Dialog open={openSalary} onClose={() => setOpenSalary(false)}>
        <DialogTitle>Update Salary</DialogTitle>
        <DialogContent>
          <TextField
            label="Salary"
            type="number"
            fullWidth
            margin="normal"
            value={salaryData.salary}
            onChange={e =>
              setSalaryData({
                ...salaryData,
                salary: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSalary(false)}>Cancel</Button>
          <Button variant="contained" onClick={saveSalary}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default Teachers
