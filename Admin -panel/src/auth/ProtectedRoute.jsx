import { useContext } from 'react'
import { Navigate } from 'react-router-dom'
import { AuthContext } from './AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext)

  // ⏳ wait until auth bootstrap completes
  if (loading) {
    return null // or spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute