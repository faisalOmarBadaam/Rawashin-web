import { apiClient } from './client'
import type { ApiResponse, QueryParams, ApiError } from './types'
import { extractApiErrorMessage, DEFAULT_API_ERROR_MESSAGE } from './error-message'

export class ApiException extends Error {
  public readonly errors?: ApiError[]
  public readonly traceId?: string

  constructor(message: string, errors?: ApiError[] | null, traceId?: string | null) {
    super(message)
    this.name = 'ApiException'
    this.errors = errors ?? undefined
    this.traceId = traceId ?? undefined
  }
}

export class ApiService {
  async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    url: string,
    data?: unknown,
    params?: QueryParams
  ): Promise<T> {
    const isFormData = data instanceof FormData

    const res = await apiClient.request({
      method,
      url,
      data,
      params,
      headers: isFormData ? undefined : { 'Content-Type': 'application/json' }
    })

    if (res.status === 204) {
      return undefined as T
    }

    const payload: any = res.data

    // ❌ خطأ حقيقي فقط إذا success === false
    if (payload?.success === false) {
      throw new ApiException(extractApiErrorMessage(payload, DEFAULT_API_ERROR_MESSAGE), payload.errors, payload.traceId)
    }

    // ✅ حالتان مدعومتان:
    // 1) ApiResponse<T>  → نرجع payload.data
    // 2) T مباشر         → نرجع payload نفسه
    return (payload?.data ?? payload) as T
  }

  get<T>(url: string, params?: QueryParams) {
    return this.request<T>('GET', url, undefined, params)
  }

  post<T, B>(url: string, body: B) {
    return this.request<T>('POST', url, body)
  }

  put<T, B>(url: string, body: B) {
    return this.request<T>('PUT', url, body)
  }

  patch<T, B>(url: string, body: B) {
    return this.request<T>('PATCH', url, body)
  }

  delete<T>(url: string, params?: QueryParams) {
    return this.request<T>('DELETE', url, undefined, params)
  }
}

export const api = new ApiService()
