import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [enrollment, setEnrollment] = useState(null) // Student enrollment snapshot
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const userId = localStorage.getItem('user_id')
    const enrollmentData = localStorage.getItem('enrollment')

    if (token && role) {
      setUser({ user_id: userId, role, token })
      if (enrollmentData) {
        setEnrollment(JSON.parse(enrollmentData))
      }
    }
    setLoading(false)
  }

  const fetchEnrollmentSnapshot = async (token) => {
    try {
      const response = await api.get('/student/current-enrollment', {
        headers: { Authorization: `Bearer ${token}` }
      })

      if (response.data.status === 'success') {
        const enrollmentData = response.data.data
        localStorage.setItem('enrollment', JSON.stringify(enrollmentData))
        setEnrollment(enrollmentData)
        return enrollmentData
      }
    } catch (err) {
      console.error('Failed to fetch enrollment:', err)
      toast.warning('Could not load enrollment data. Some features may be limited.')
    }
    return null
  }

  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/signin', { username, password })
      const { data } = response

      if (data.status === 'success' && data.data.token) {
        const { token, role } = data.data

        localStorage.setItem('token', token)
        localStorage.setItem('role', role)

        const tokenParts = token.split('.')
        const payload = JSON.parse(atob(tokenParts[1]))
        localStorage.setItem('user_id', payload.user_id)

        setUser({ user_id: payload.user_id, role, token })

        // Fetch enrollment snapshot for students
        if (role === 'student') {
          await fetchEnrollmentSnapshot(token)
        }

        toast.success(`Welcome! Logged in as ${role}`)

        switch (role) {
          case 'student':
            navigate('/student/dashboard')
            break
          case 'teacher':
            navigate('/teacher/dashboard')
            break
          case 'accountant':
            navigate('/accountant/dashboard')
            break
          case 'admin':
            navigate('/admin/dashboard')
            break
          default:
            navigate('/')
        }

        return { success: true }
      } else {
        toast.error(data.message || 'Invalid credentials')
        return { success: false, message: data.message }
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Login failed. Please try again.'
      toast.error(errorMsg)
      return { success: false, message: errorMsg }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user_id')
    localStorage.removeItem('enrollment')
    setUser(null)
    setEnrollment(null)
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const refreshEnrollment = async () => {
    const token = localStorage.getItem('token')
    if (token && user?.role === 'student') {
      await fetchEnrollmentSnapshot(token)
    }
  }

  const value = {
    user,
    enrollment,
    login,
    logout,
    refreshEnrollment,
    loading,
    isAuthenticated: !!user,
    role: user?.role
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}