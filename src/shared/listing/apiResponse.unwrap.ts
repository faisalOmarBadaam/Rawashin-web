import type { ApiResponse } from '@/libs/api/types'

const isApiResponse = <T>(value: unknown): value is ApiResponse<T> => {
  if (!value || typeof value !== 'object') return false
  return 'success' in (value as Record<string, unknown>)
}

export const unwrapApiResponse = <T>(res: unknown): T => {
  if (isApiResponse<T>(res)) {
    if (!res.success) {
      throw new Error(res.message || 'Request failed')
    }

    return res.data
  }

  if (
    res &&
    typeof res === 'object' &&
    'data' in (res as Record<string, unknown>) &&
    isApiResponse<T>((res as { data: unknown }).data)
  ) {
    const payload = (res as { data: ApiResponse<T> }).data
    if (!payload.success) {
      throw new Error(payload.message || 'Request failed')
    }

    return payload.data
  }

  return res as T
}
