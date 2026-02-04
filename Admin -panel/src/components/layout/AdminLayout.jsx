import { Box } from '@mui/material'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

const AdminLayout = () => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />

      <Box sx={{ flexGrow: 1 }}>
        <Topbar />

        {/* MAIN CONTENT */}
        <Box sx={{ p: 1 }}> {/* 👈 reduce padding */}
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

export default AdminLayout
