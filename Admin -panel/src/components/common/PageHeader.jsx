import { Box, Typography } from '@mui/material'

const PageHeader = ({ title, subtitle }) => {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h5">{title}</Typography>
      {subtitle && (
        <Typography color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  )
}

export default PageHeader
