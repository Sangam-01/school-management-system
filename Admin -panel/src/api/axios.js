import axios from 'axios'

/* =========================
   AXIOS INSTANCE
========================= */
const api = axios.create({
  baseURL: 'http://localhost:4000', // backend base URL
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

/* =========================
   REQUEST INTERCEPTOR
   → Attach JWT token
========================= */
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')

    if (token) {
      // MUST match backend: req.headers.authorization
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

/* =========================
   RESPONSE INTERCEPTOR
   → Global error handling
========================= */
api.interceptors.response.use(
  response => response,
  error => {
    // Server / network error
    if (!error.response) {
      alert('❌ Server not reachable')
      return Promise.reject(error)
    }

    const { status, data } = error.response

    // JWT invalid / expired
    if (status === 401 || status === 403) {
      console.warn('Session expired. Redirecting to login.')
      localStorage.clear()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Optional: show backend error message
    if (data?.error || data?.message) {
      console.error(data.error || data.message)
    }

    return Promise.reject(error)
  }
)

export default api
