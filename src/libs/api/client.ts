import axios, { type AxiosError } from 'axios'

import { secureLogout } from '@/core/auth/secureLogout'
import { apiConfig } from './config'
import { endpoints } from './endpoints'
import { extractApiErrorMessage } from './error-message'
import { AuthApi } from './modules/auth.api'
import { tokenStore } from './tokenStore'

export const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  withCredentials: apiConfig.withCredentials,
})

apiClient.interceptors.request.use(config => {
  const token = tokenStore.getAccessToken()

  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

let isRefreshing = false

let queue: {
  resolve: (token: string) => void
  reject: (error: unknown) => void
}[] = []

const processQueue = (error: unknown, token: string | null) => {
  queue.forEach(p => {
    if (error) p.reject(error)
    else if (token) p.resolve(token)
  })
  queue = []
}

apiClient.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const responseData = error.response?.data as
      | {
          detail?: string | null
          message?: string | null
          error?: string | null
          title?: string | null
          errors?: Array<{ message?: string | null }> | Record<string, string[]> | null
        }
      | undefined

    const normalizedMessage = extractApiErrorMessage(responseData, error.message)

    if (responseData) {
      responseData.message = normalizedMessage
    }

    error.message = normalizedMessage

    const originalRequest: any = error.config ?? {}
    const is401 = error.response?.status === 401

    const isRefreshCall =
      typeof originalRequest.url === 'string' &&
      originalRequest.url.includes(endpoints.auth.refresh)

    if (is401 && !originalRequest._retry && !isRefreshCall) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: (token: string) => {
              originalRequest.headers = originalRequest.headers ?? {}
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(apiClient(originalRequest))
            },
            reject,
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const refreshToken = tokenStore.getRefreshToken()

        if (!refreshToken) throw error

        const data = await AuthApi.refresh({ refreshToken })

        if (!data?.accessToken) throw error

        tokenStore.setTokens({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken ?? undefined,
        })

        processQueue(null, data.accessToken)

        originalRequest.headers = originalRequest.headers ?? {}
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`

        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        secureLogout()

        if (typeof window !== 'undefined') {
          const pathname = window.location.pathname
          const segments = pathname.split('/').filter(Boolean)
          const locale = segments[0]
          const isSupportedLocale = locale === 'ar' || locale === 'en'

          window.location.href = isSupportedLocale ? `/${locale}/login` : '/ar/login'
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
