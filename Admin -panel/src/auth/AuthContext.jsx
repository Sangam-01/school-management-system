import { createContext, useEffect, useState } from 'react'
import api from '../api/axios'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const [academicYears, setAcademicYears] = useState([])
  const [academicYear, setAcademicYear] = useState(null)

  /* =========================
     AUTH BOOTSTRAP
  ========================= */
  useEffect(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')

    if (token && role) {
      setUser({ role })
    } else {
      setUser(null)
    }

    setLoading(false)
  }, [])

  /* =========================
     LOAD ACADEMIC YEARS
  ========================= */
  const loadAcademicYears = async () => {
    try {
      const res = await api.get('/admin/academic-years')
      if (res.data.status === 'success') {
        const years = res.data.data

        setAcademicYears(years)

        const savedYearId = Number(
          localStorage.getItem('academic_year_id')
        )

        let selected =
          years.find(y => y.academic_year_id === savedYearId) ||
          years.find(y => y.is_active) ||
          [...years].sort(
            (a, b) => b.academic_year_id - a.academic_year_id
          )[0] ||
          null

        setAcademicYear(selected)
      }
    } catch (err) {
      console.error('Failed to load academic years')
    }
  }

  useEffect(() => {
    if (user) {
      loadAcademicYears()
    }
  }, [user])

  /* =========================
     PERSIST SELECTED YEAR
  ========================= */
  useEffect(() => {
    if (academicYear) {
      localStorage.setItem(
        'academic_year_id',
        academicYear.academic_year_id
      )
    }
  }, [academicYear])

  /* =========================
     LOGOUT
  ========================= */
  const logout = () => {
    localStorage.clear()
    setUser(null)
    setAcademicYear(null)
    setAcademicYears([])
    window.location.href = '/login'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        academicYears,
        academicYear,
        setAcademicYear,
        reloadAcademicYears: loadAcademicYears,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
