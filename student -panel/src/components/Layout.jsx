import { Box, useMediaQuery, useTheme } from '@mui/material'
import { useState } from 'react'
import Navbar from './Navbar'
import Sidebar from './Sidebar'

const Layout = ({ children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      <Navbar onMenuClick={handleDrawerToggle} />
      
      <Box sx={{ display: 'flex', flex: 1 }}>
        <Sidebar 
          open={isMobile ? mobileOpen : true} 
          onClose={handleDrawerToggle}
          isMobile={isMobile}
        />
        
        <Box 
          component="main" 
          sx={{ 
            flexGrow: 1, 
            p: 3, 
            bgcolor: '#f5f5f5',
            minHeight: 'calc(100vh - 64px)'
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default Layout
