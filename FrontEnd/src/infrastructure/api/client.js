import axios from 'axios'
import { getToken, setToken, getRefreshToken, setRefreshToken, clearToken } from '../storage/tokenStorage'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

const apiClient = axios.create({ baseURL: BASE_URL })

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshing = null

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    const isAuthEndpoint = original.url?.includes('/auth/login') || original.url?.includes('/auth/signup')
    if (error.response?.status !== 401 || original._retry || isAuthEndpoint) {
      return Promise.reject(error)
    }
    original._retry = true

    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      clearToken()
      window.location.href = '/login'
      return Promise.reject(error)
    }

    if (!refreshing) {
      refreshing = axios.post(`${BASE_URL}/auth/refresh`, { refreshToken })
        .then(({ data }) => {
          setToken(data.accessToken)
          setRefreshToken(data.refreshToken)
          return data.accessToken
        })
        .catch(() => {
          clearToken()
          window.location.href = '/login'
          return null
        })
        .finally(() => { refreshing = null })
    }

    const newToken = await refreshing
    if (!newToken) return Promise.reject(error)
    original.headers.Authorization = `Bearer ${newToken}`
    return apiClient(original)
  }
)

export default apiClient
