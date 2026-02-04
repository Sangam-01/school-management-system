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

const Accountants = () => {
  const [accountants, setAccountants] = useState([])
  const [openAdd, setOpenAdd] = useState(false)
  const [openSalary, setOpenSalary] = useState(false)

  const [salaryData, setSalaryData] = useState({
    employee_id: null,
    salary: '',
  })

  const load = () => {
    api.get('/admin/accountants').then(res => {
      if (res.data.status === 'success') {
        setAccountants(res.data.data)
      }
    })
  }

  useEffect(load, [])

  const saveSalary = () => {
    api
      .put('/admin/accountant/update-salary', salaryData)
      .then(() => {
        setOpenSalary(false)
        load()
      })
  }

  const toggleStatus = a => {
    api
      .put('/admin/accountant/change-status', {
        user_id: a.user_id,
        status: a.status === 'active' ? 'inactive' : 'active',
      })
      .then(load)
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Accountants
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        sx={{ mb: 2 }}
        onClick={() => setOpenAdd(true)}
      >
        Add Accountant
      </Button>

      <Grid container spacing={2}>
        {accountants.map(a => (
          <Grid item xs={12} md={4} key={a.employee_id}>
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Typography variant="h6">
                  {a.fname} {a.lname}
                </Typography>

                <Typography color="text.secondary">
                  Salary: ₹{a.salary}
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
                        employee_id: a.employee_id,
                        salary: a.salary,
                      })
                      setOpenSalary(true)
                    }}
                  >
                    <EditIcon />
                  </IconButton>

                  <Switch
                    checked={a.status === 'active'}
                    onChange={() => toggleStatus(a)}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* ADD ACCOUNTANT */}
      <AddUserDialog
        open={openAdd}
        onClose={() => setOpenAdd(false)}
        role="accountant"
        onSuccess={load}
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

export default Accountants
