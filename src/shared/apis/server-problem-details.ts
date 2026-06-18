import axios from 'axios'

export type ServerFieldErrors = Record<string, string[]>

export type ServerProblemDetailsError = {
  type?: string
  title: string
  status: number
  detail?: string
  errors?: ServerFieldErrors
}

export function isServerProblemDetailsError(
  value: unknown
): value is ServerProblemDetailsError {
  if (!value || typeof value !== 'object') {
    return false
  }

  const error = value as Partial<ServerProblemDetailsError>

  return (
    typeof error.title === 'string' &&
    typeof error.status === 'number'
  )
}

export function getServerProblemDetailsError(
  error: unknown
): ServerProblemDetailsError | null {
  if (!axios.isAxiosError(error)) {
    return null
  }

  const data = error.response?.data

  if (!isServerProblemDetailsError(data)) {
    return null
  }

  return data
}

export function hasServerFieldErrors(
  error: ServerProblemDetailsError
) {
  return Boolean(error.errors && Object.keys(error.errors).length > 0)
}