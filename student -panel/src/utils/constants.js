// User Roles
export const ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student',
  ACCOUNTANT: 'accountant'
}

// Routes
export const ROUTES = {
  LOGIN: '/login',
  
  // Student Routes
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_PROFILE: '/student/profile',
  STUDENT_ATTENDANCE: '/student/attendance',
  STUDENT_MARKS: '/student/marks',
  
  // Teacher Routes
  TEACHER_DASHBOARD: '/teacher/dashboard',
  TEACHER_PROFILE: '/teacher/profile',
  TEACHER_ATTENDANCE: '/teacher/attendance',
  TEACHER_MARKS: '/teacher/marks',
  TEACHER_CLASS: '/teacher/class',
  
  // Accountant Routes
  ACCOUNTANT_DASHBOARD: '/accountant/dashboard',
  ACCOUNTANT_PROFILE: '/accountant/profile',
  ACCOUNTANT_FEES: '/accountant/fees',
  ACCOUNTANT_FEE_CATEGORIES: '/accountant/fee-categories',
  ACCOUNTANT_STUDENTS: '/accountant/students',
  ACCOUNTANT_REPORTS: '/accountant/reports',
  ACCOUNTANT_TRANSACTIONS: '/accountant/transactions'
}

// Month Names
export const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' }
]

// Fee Status
export const FEE_STATUS = {
  PAID: 'Paid',
  PENDING: 'Pending',
  OVERDUE: 'Overdue'
}

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'Present',
  ABSENT: 'Absent'
}

// Gender Options
export const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' }
]

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/signin',
  REGISTER: '/auth/registration',
  
  // Student
  STUDENT_PROFILE: '/student/profile',
  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_MARKS: '/student/marks',
  STUDENT_ATTENDANCE: '/student/attendance',
  STUDENT_UPDATE_PROFILE: '/student/profile/update',
  
  // Teacher
  TEACHER_PROFILE: '/teacher/profile',
  TEACHER_DASHBOARD: '/teacher/dashboard',
  TEACHER_CLASSES: '/teacher/class',
  TEACHER_SUBJECTS: '/teacher/subjects',
  TEACHER_STUDENTS: '/teacher/class/students',
  TEACHER_MARK_ATTENDANCE: '/teacher/attendance/mark',
  TEACHER_VIEW_ATTENDANCE: '/teacher/attendance',
  TEACHER_ADD_MARKS: '/teacher/marks/add',
  TEACHER_CLASS_PERFORMANCE: '/teacher/class/performance',
  
  // Accountant
  ACCOUNTANT_PROFILE: '/accountant/profile',
  ACCOUNTANT_DASHBOARD: '/accountant/dashboard',
  ACCOUNTANT_FEE_CATEGORIES: '/accountant/fee-categories',
  ACCOUNTANT_STUDENTS_FEES: '/accountant/students/fees',
  ACCOUNTANT_STUDENT_FEE_DETAILS: '/accountant/students/:id/fees',
  ACCOUNTANT_ASSIGN_FEE: '/accountant/fees/assign',
  ACCOUNTANT_COLLECT_FEE: '/accountant/fees/collect/:id',
  ACCOUNTANT_BULK_ASSIGN: '/accountant/fees/assign-bulk',
  ACCOUNTANT_DEFAULTERS: '/accountant/defaulters',
  ACCOUNTANT_TRANSACTIONS: '/accountant/transactions/recent'
}

// Chart Colors
export const CHART_COLORS = {
  primary: '#1976d2',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1'
}

// Format Currency
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(amount)
}

// Format Date
export const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Get Month Name
export const getMonthName = (month) => {
  return MONTHS.find(m => m.value === parseInt(month))?.label || '-'
}
