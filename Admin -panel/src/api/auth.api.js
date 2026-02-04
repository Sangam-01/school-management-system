import api from './axios'

export const login = (data) => {
  return api.post('/auth/signin', data)
}

export const registerUser = (data) => {
  return api.post('/auth/registration', data)
}
