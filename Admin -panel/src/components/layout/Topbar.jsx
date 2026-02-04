import {
  Box,
  Typography,
  Select,
  MenuItem,
  Button,
} from '@mui/material'
import { useContext } from 'react'
import { AuthContext } from '../../auth/AuthContext'

const Topbar = () => {
  const {
    academicYears,
    academicYear,
    setAcademicYear,
    logout,
  } = useContext(AuthContext)

  return (
    <Box
      sx={{
        height: 64,
        px: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e0e0e0',
        backgroundColor: '#fff',
      }}
    >
      <Typography variant="h6">
        Admin Panel
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography variant="body2">
          Academic Year
        </Typography>

        <Select
          size="small"
          value={academicYear?.academic_year_id || ''}
          displayEmpty
          onChange={e => {
            const selected = academicYears.find(
              y => y.academic_year_id === e.target.value
            )
            setAcademicYear(selected)
          }}
        >
          <MenuItem value="">
            Select Year
          </MenuItem>

          {academicYears.map(y => (
            <MenuItem
              key={y.academic_year_id}
              value={y.academic_year_id}
            >
              {y.year_name}
            </MenuItem>
          ))}
        </Select>

        <Button
          variant="outlined"
          color="error"
          onClick={logout}
        >
          Logout
        </Button>
      </Box>
    </Box>
  )
}

export default Topbar
