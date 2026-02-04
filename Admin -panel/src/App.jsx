import { Routes, Route } from 'react-router-dom'
import Login from './pages/auth/Login'
import AdminLayout from './components/layout/AdminLayout'
import ProtectedRoute from './auth/ProtectedRoute'
import ClassProfile from './pages/classes/ClassProfile'
import Dashboard from './pages/dashboard/Dashboard'
import AcademicYear from './pages/academicYear/AcademicYear'
import Teachers from './pages/teachers/Teachers'
import Accountants from './pages/accountants/Accountants'
import Classes from './pages/classes/Classes'
import Students from './pages/students/Students'
import PromoteStudents from './pages/students/PromoteStudents'
import FeeStructure from './pages/fees/FeeStructure'
import FeePayments from './pages/fees/FeePayments'
import Defaulters from './pages/fees/Defaulters'
import AddStudent from './pages/students/AddStudent'


function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="academic-year" element={<AcademicYear />} />
        <Route path="teachers" element={<Teachers />} />
        <Route path="accountants" element={<Accountants />} />
        <Route path="classes" element={<Classes />} />
        <Route path="students" element={<Students />} />
        <Route path="students/promote" element={<PromoteStudents />} />
        <Route path="fees/structure" element={<FeeStructure />} />
        <Route path="classes/:class_id" element={<ClassProfile />} />
        <Route path="fees/payments" element={<FeePayments />} />
        <Route path="fees/defaulters" element={<Defaulters />} />
        <Route path="students/add" element={<AddStudent />} />
      </Route>
    </Routes>
  )
}

export default App
