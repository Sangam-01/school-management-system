import { Box, Typography } from '@mui/material'
import { useContext } from 'react'
import { AuthContext } from '../../auth/AuthContext'

const RequireAcademicYear = ({ children }) => {
  const { academicYear } = useContext(AuthContext)

  if (!academicYear) {
    return (
      <Box
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Select Academic Year
        </Typography>
        <Typography color="text.secondary">
          Please select an academic year from the top bar to continue.
        </Typography>
      </Box>
    )
  }

  return children
}

export default RequireAcademicYear
