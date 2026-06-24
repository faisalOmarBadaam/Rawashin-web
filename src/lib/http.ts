import { getServerProblemDetailsError } from '@/shared/apis/server-problem-details'
import axios from 'axios'
import { clearAuthSession, getAccessToken, getRefreshToken, storeAuthSession } from '@/features/auth/utils/session'

const REFRESH_ENDPOINT = '/api/v2/auths/refresh'


export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})


http.interceptors.request.use(
  config => {
    const token = getAccessToken()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    return config
  },
  error => {
    return Promise.reject(error)
  }
)

http.interceptors.response.use(
  response => {
    return response
  },
  async error => {
    const originalRequest = error.config as typeof error.config & {
      _retry?: boolean
    }
    const status = error.response?.status
    const refreshToken = getRefreshToken()
    const requestUrl = String(originalRequest?.url ?? '')
    const isAuthRequest = requestUrl.includes('/auths/login') || requestUrl.includes('/auths/refresh') || requestUrl.includes('/auths/logout')

    if (status === 401 && !originalRequest?._retry && refreshToken && !isAuthRequest) {
      originalRequest._retry = true

      try {
        const refreshResponse = await http.post(REFRESH_ENDPOINT, { refreshToken })
        storeAuthSession(refreshResponse.data)

        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.accessToken}`

        return http(originalRequest)
      } catch {
        clearAuthSession()
        window.location.href = '/login'
      }
    }

    if (status === 401) {
      clearAuthSession()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

http.interceptors.response.use(
  (response) => response,
  (error) => {
    const serverError = getServerProblemDetailsError(error)

    if (serverError) {
      return Promise.reject(serverError)
    }

    return Promise.reject(error)
  })