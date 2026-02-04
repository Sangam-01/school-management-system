import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography,
  } from '@mui/material'
  import { useContext, useEffect, useState } from 'react'
  import api from '../../api/axios'
  import { AuthContext } from '../../auth/AuthContext'
  
  const Defaulters = () => {
    const { academicYear } = useContext(AuthContext)
    const [data, setData] = useState([])
  
    useEffect(() => {
      if (!academicYear) return
      api
        .get(`/admin/fees/defaulters/${academicYear.academic_year_id}`)
        .then(res => {
          if (res.data.status === 'success') {
            setData(res.data.data)
          }
        })
    }, [academicYear])
  
    return (
      <Box>
        <Typography variant="h5">Fee Defaulters</Typography>
  
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Reg No</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Class</TableCell>
              <TableCell>Pending</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((d, i) => (
              <TableRow key={i}>
                <TableCell>{d.reg_no}</TableCell>
                <TableCell>{d.name}</TableCell>
                <TableCell>
                  {d.class_level}-{d.division}
                </TableCell>
                <TableCell>₹{d.pending}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    )
  }
  
  export default Defaulters
  