import api from './axios'

export const getAcademicYears = () =>
  api.get('/admin/academic-years')

export const createAcademicYear = (data) =>
  api.post('/admin/academic-year', data)

export const closeAcademicYear = (id) =>
  api.put(`/admin/academic-year/close/${id}`)

export const getDashboard = (yearId) =>
  api.get(`/admin/dashboard/${yearId}`)

export const getClasses = (yearId) =>
  api.get(`/admin/classes/${yearId}`)

export const getStudents = (yearId) =>
  api.get(`/admin/students/${yearId}`)
