import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'

const BASE_URL = 'http://192.168.1.107:4000' // <-- change to your server
console.log("API BASE URL:", BASE_URL)
const api = axios.create({ baseURL: BASE_URL })

// attach token to every request
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// if 401 anywhere → clear storage (session expired)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    if (err.response?.status === 401) {
      await AsyncStorage.clear()
    }
    return Promise.reject(err)
  }
)

export default api