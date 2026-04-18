export type ApiErrorMessageSource = {
  detail?: string | null
  message?: string | null
  error?: string | null
  title?: string | null
  errors?: Array<{ message?: string | null }> | Record<string, string[]> | null
}

export const DEFAULT_API_ERROR_MESSAGE = 'حدث خطأ غير متوقع'

const getProblemDetailsErrorMessage = (
  errors?: ApiErrorMessageSource['errors'],
): string | undefined => {
  if (!errors || Array.isArray(errors)) return undefined

  const firstErrorGroup = Object.values(errors)[0]

  return Array.isArray(firstErrorGroup) ? firstErrorGroup[0] : undefined
}

export const extractApiErrorMessage = (
  source?: ApiErrorMessageSource | null,
  fallbackMessage?: string | null,
) =>
  getProblemDetailsErrorMessage(source?.errors) ??
  source?.detail ??
  source?.message ??
  source?.error ??
  (Array.isArray(source?.errors) ? source?.errors?.[0]?.message : undefined) ??
  source?.title ??
  fallbackMessage ??
  DEFAULT_API_ERROR_MESSAGE

export const mapValidationErrors = (
  errors?: Record<string, string[]> | null,
): Record<string, string> => {
  if (!errors) return {}

  return Object.fromEntries(
    Object.entries(errors)
      .map(([field, messages]) => [field, messages?.[0]])
      .filter((entry): entry is [string, string] => Boolean(entry[1])),
  )
}
