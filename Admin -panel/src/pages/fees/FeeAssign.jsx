import {
    Box,
    Button,
    MenuItem,
    Select,
    Typography,
  } from '@mui/material'
  import { useContext, useEffect, useState } from 'react'
  import api from '../../api/axios'
  import { AuthContext } from '../../auth/AuthContext'
  
  const FeeAssign = () => {
    const { academicYear } = useContext(AuthContext)
    const [classes, setClasses] = useState([])
    const [classId, setClassId] = useState('')
  
    useEffect(() => {
      if (!academicYear) return
      api
        .get(`/admin/classes/${academicYear.academic_year_id}`)
        .then(res => {
          if (res.data.status === 'success') {
            setClasses(res.data.data)
          }
        })
    }, [academicYear])
  
    const assign = () => {
      api.post('/admin/fees/assign/class', {
        class_id: classId,
        academic_year_id: academicYear.academic_year_id,
      }).then(() => alert('Fees assigned'))
    }
  
    return (
      <Box>
        <Typography variant="h5">Assign Fees to Class</Typography>
  
        <Select
          fullWidth
          value={classId}
          onChange={e => setClassId(e.target.value)}
          sx={{ maxWidth: 400, mt: 2 }}
        >
          {classes.map(c => (
            <MenuItem key={c.class_id} value={c.class_id}>
              {c.class_level}-{c.division}
            </MenuItem>
          ))}
        </Select>
  
        <Button
          variant="contained"
          sx={{ mt: 2 }}
          onClick={assign}
        >
          Assign Fees
        </Button>
      </Box>
    )
  }
  
  export default FeeAssign
  