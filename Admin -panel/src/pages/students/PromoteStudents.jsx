import {
    Box,
    Button,
    Card,
    CardContent,
    MenuItem,
    Select,
    Typography,
  } from '@mui/material'
  import { useContext, useEffect, useState } from 'react'
  import api from '../../api/axios'
  import { AuthContext } from '../../auth/AuthContext'
  
  const PromoteStudents = () => {
    const { academicYear } = useContext(AuthContext)
  
    const [years, setYears] = useState([])
    const [classes, setClasses] = useState([])
    const [form, setForm] = useState({
      from_year: '',
      to_year: '',
      from_class: '',
      to_class: '',
    })
  
    useEffect(() => {
      api.get('/admin/academic-years').then(res => {
        if (res.data.status === 'success') {
          setYears(res.data.data)
        }
      })
    }, [])
  
    useEffect(() => {
      if (form.from_year) {
        api
          .get(`/admin/classes/${form.from_year}`)
          .then(res => {
            if (res.data.status === 'success') {
              setClasses(res.data.data)
            }
          })
      }
    }, [form.from_year])
  
    const promote = () => {
      api
        .post('/admin/students/promote', {
          from_academic_year_id: form.from_year,
          to_academic_year_id: form.to_year,
          from_class_id: form.from_class,
          to_class_id: form.to_class,
        })
        .then(res => {
          alert(res.data.data)
        })
    }
  
    return (
      <Box>
        <Typography variant="h5" gutterBottom>
          Promote Students
        </Typography>
  
        <Card sx={{ maxWidth: 500, borderRadius: 3 }}>
          <CardContent>
            <Typography>From Academic Year</Typography>
            <Select
              fullWidth
              value={form.from_year}
              onChange={e =>
                setForm({ ...form, from_year: e.target.value })
              }
              sx={{ mb: 2 }}
            >
              {years.map(y => (
                <MenuItem
                  key={y.academic_year_id}
                  value={y.academic_year_id}
                >
                  {y.year_name}
                </MenuItem>
              ))}
            </Select>
  
            <Typography>To Academic Year</Typography>
            <Select
              fullWidth
              value={form.to_year}
              onChange={e =>
                setForm({ ...form, to_year: e.target.value })
              }
              sx={{ mb: 2 }}
            >
              {years.map(y => (
                <MenuItem
                  key={y.academic_year_id}
                  value={y.academic_year_id}
                >
                  {y.year_name}
                </MenuItem>
              ))}
            </Select>
  
            <Typography>From Class</Typography>
            <Select
              fullWidth
              value={form.from_class}
              onChange={e =>
                setForm({ ...form, from_class: e.target.value })
              }
              sx={{ mb: 2 }}
            >
              {classes.map(c => (
                <MenuItem key={c.class_id} value={c.class_id}>
                  {c.class_level}-{c.division}
                </MenuItem>
              ))}
            </Select>
  
            <Typography>To Class</Typography>
            <Select
              fullWidth
              value={form.to_class}
              onChange={e =>
                setForm({ ...form, to_class: e.target.value })
              }
              sx={{ mb: 2 }}
            >
              {classes.map(c => (
                <MenuItem key={c.class_id} value={c.class_id}>
                  {c.class_level}-{c.division}
                </MenuItem>
              ))}
            </Select>
  
            <Button
              fullWidth
              variant="contained"
              color="success"
              onClick={promote}
            >
              Promote Students
            </Button>
          </CardContent>
        </Card>
      </Box>
    )
  }
  
  export default PromoteStudents
  