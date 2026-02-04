import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
  } from '@mui/material'
  import DashboardIcon from '@mui/icons-material/Dashboard'
  import SchoolIcon from '@mui/icons-material/School'
  import GroupIcon from '@mui/icons-material/Group'
  import ClassIcon from '@mui/icons-material/Class'
  import PaymentsIcon from '@mui/icons-material/Payments'
  import { useNavigate } from 'react-router-dom'
  
  const Sidebar = () => {
    const navigate = useNavigate()
  
    const menu = [
      { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
      { text: 'Academic Year', icon: <SchoolIcon />, path: '/academic-year' },
      { text: 'Teachers', icon: <GroupIcon />, path: '/teachers' },
      { text: 'Accountants', icon: <GroupIcon />, path: '/accountants' },
      { text: 'Classes', icon: <ClassIcon />, path: '/classes' },
      { text: 'Students', icon: <GroupIcon />, path: '/students' },
      { text: 'Fees', icon: <PaymentsIcon />, path: '/fees/structure' },
    ]
  
    return (
      <Box
        sx={{
          width: 240,
          minHeight: '100vh',
          backgroundColor: '#0d47a1',
          color: '#fff',
        }}
      >
        <Typography
          variant="h6"
          sx={{ p: 2, textAlign: 'center', fontWeight: 'bold' }}
        >
          SCHOOL ERP
        </Typography>
  
        <List>
          {menu.map(item => (
            <ListItemButton
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                '&:hover': { backgroundColor: '#1565c0' },
              }}
            >
              <ListItemIcon sx={{ color: '#fff' }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          ))}
        </List>
      </Box>
    )
  }
  
  export default Sidebar
  