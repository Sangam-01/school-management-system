import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // Check if user is already logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const userId = localStorage.getItem('user_id')

    if (token && role) {
      setUser({ user_id: userId, role, token })
    }
    setLoading(false)
  }, [])

  // Login function
  const login = async (username, password) => {
    try {
      const response = await api.post('/auth/signin', {
        username,
        password
      })

      const { data } = response

      // Check if login was successful
      if (data.status === 'success' && data.data.token) {
        const { token, role } = data.data

        // Store in localStorage
        localStorage.setItem('token', token)
        localStorage.setItem('role', role)

        // Decode token to get user_id (simple base64 decode of JWT payload)
        const tokenParts = token.split('.')
        const payload = JSON.parse(atob(tokenParts[1]))
        localStorage.setItem('user_id', payload.user_id)

        // Update state
        setUser({ user_id: payload.user_id, role, token })

        // Show success message
        toast.success(`Welcome! Logged in as ${role}`)

        // Navigate based on role
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

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    localStorage.removeItem('user_id')
    setUser(null)
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user,
    role: user?.role
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
