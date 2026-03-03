import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth/useAuth'
import ProtectedRoute from './routes/ProtectedRoute'
import Layout from './components/Layout'

// Pages
import Login from './pages/login/Login'

// Student Pages
import StudentDashboard from './pages/student/Dashboard'
import StudentProfile from './pages/student/Profile'
import StudentAttendance from './pages/student/Attendance'
import StudentMarks from './pages/student/Marks'

// Teacher Pages
import TeacherDashboard from './pages/teacher/Dashboard'
import TeacherProfile from './pages/teacher/Profile'
import TeacherAttendance from './pages/teacher/Attendance'
import TeacherMarks from './pages/teacher/Marks'
import TeacherClassPerformance from './pages/teacher/ClassPerformance'

// Accountant Pages
import AccountantDashboard from './pages/accountant/Dashboard'
import AccountantProfile from './pages/accountant/Profile'
import FeeCategories from './pages/accountant/FeeCategories'
import StudentFees from './pages/accountant/StudentFees'
import Transactions from './pages/accountant/Transactions'
import Reports from './pages/accountant/Reports'
import Defaulters from './pages/accountant/Defaulters'

// import { ROLES } from './utils/constants'

function App() {
  const { user } = useAuth()

  return (
    <Routes>
      {/* Public Route */}
      <Route 
        path="/login" 
        element={user ? <Navigate to={`/${user.role}/dashboard`} /> : <Login />} 
      />

      {/* Default Route - Redirect to appropriate dashboard */}
      <Route 
        path="/" 
        element={
          user ? (
            <Navigate to={`/${user.role}/dashboard`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        } 
      />

      {/* Student Routes */}
      <Route
        path="/student/*"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<StudentDashboard />} />
                <Route path="profile" element={<StudentProfile />} />
                <Route path="attendance" element={<StudentAttendance />} />
                <Route path="marks" element={<StudentMarks />} />
                <Route path="*" element={<Navigate to="/student/dashboard" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Teacher Routes */}
      <Route
        path="/teacher/*"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<TeacherDashboard />} />
                <Route path="profile" element={<TeacherProfile />} />
                <Route path="attendance" element={<TeacherAttendance />} />
                <Route path="marks" element={<TeacherMarks />} />
                <Route path="performance" element={<TeacherClassPerformance />} />
                <Route path="*" element={<Navigate to="/teacher/dashboard" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Accountant Routes */}
      <Route
        path="/accountant/*"
        element={
          <ProtectedRoute allowedRoles={['accountant']}>
            <Layout>
              <Routes>
                <Route path="dashboard" element={<AccountantDashboard />} />
                <Route path="profile" element={<AccountantProfile />} />
                <Route path="fee-categories" element={<FeeCategories />} />
                //<Route path="students" element={<StudentFees />} />
                <Route path="transactions" element={<Transactions />} />
                <Route path="reports" element={<Reports />} />
                <Route path="defaulters" element={<Defaulters />} />
                <Route path="*" element={<Navigate to="/accountant/dashboard" />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
