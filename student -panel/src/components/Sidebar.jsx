import { Box, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Drawer } from '@mui/material'
import {
  Dashboard,
  Person,
  EventNote,
  Assessment,
  Category,
  People,
  AttachMoney,
  Receipt,
  BarChart,
  Warning
} from '@mui/icons-material'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const Sidebar = ({ open, onClose, isMobile }) => {
  const { user } = useAuth()

  const getMenuItems = () => {
    switch (user?.role) {
      case 'student':
        return [
          { text: 'Dashboard', icon: <Dashboard />, path: '/student/dashboard' },
          { text: 'Profile', icon: <Person />, path: '/student/profile' },
          { text: 'Attendance', icon: <EventNote />, path: '/student/attendance' },
          { text: 'Marks', icon: <Assessment />, path: '/student/marks' },
        ]
      case 'teacher':
        return [
          { text: 'Dashboard', icon: <Dashboard />, path: '/teacher/dashboard' },
          { text: 'Profile', icon: <Person />, path: '/teacher/profile' },
          { text: 'Attendance', icon: <EventNote />, path: '/teacher/attendance' },
          { text: 'Marks', icon: <Assessment />, path: '/teacher/marks' },
          { text: 'Performance', icon: <BarChart />, path: '/teacher/performance' },
        ]
      case 'accountant':
        return [
          { text: 'Dashboard', icon: <Dashboard />, path: '/accountant/dashboard' },
          { text: 'Profile', icon: <Person />, path: '/accountant/profile' },
          // { text: 'Fee Categories', icon: <Category />, path: '/accountant/fee-categories' },
          { text: 'Student Fees', icon: <People />, path: '/accountant/students' },
          { text: 'Transactions', icon: <Receipt />, path: '/accountant/transactions' },
          { text: 'Reports', icon: <BarChart />, path: '/accountant/reports' },
          { text: 'Defaulters', icon: <Warning />, path: '/accountant/defaulters' },
        ]
      default:
        return []
    }
  }

  const menuItems = getMenuItems()

  const sidebarContent = (
    <Box sx={{ width: 250, pt: 2 }}>
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding sx={{ mb: 0.5, px: 1 }}>
            <ListItemButton
              component={NavLink}
              to={item.path}
              onClick={isMobile ? onClose : undefined}
              sx={{
                borderRadius: 2,
                '&.active': {
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  '& .MuiListItemIcon-root': {
                    color: 'primary.main',
                  },
                },
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  )

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 250,
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    )
  }

  return (
    <Box
      sx={{
        width: 250,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 250,
          boxSizing: 'border-box',
          position: 'relative',
          height: '100%',
        },
      }}
    >
      {sidebarContent}
    </Box>
  )
}

export default Sidebar
