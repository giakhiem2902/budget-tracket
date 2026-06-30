import axios from 'axios'
import { authService } from './auth'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async config => {
  const token = await authService.getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  res => res.data,
  async err => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      // getToken() calls getSession() which auto-refreshes via Cognito refresh token
      const token = await authService.getToken()
      if (token) {
        original.headers.Authorization = `Bearer ${token}`
        return api(original)
      }
      authService.logout()
      window.location.href = '/login'
    }
    return Promise.reject(err.response?.data ?? err)
  }
)

export default api
