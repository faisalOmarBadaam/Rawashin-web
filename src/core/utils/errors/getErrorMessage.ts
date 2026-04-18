export const getErrorMessage = (error: unknown, fallback = 'حدث خطأ غير متوقع') => {
  const e = error as {
    message?: string
    response?: {
      data?: {
        detail?: string | null
        message?: string | null
        error?: string | null
        title?: string | null
        errors?: Array<{ message?: string | null }> | Record<string, string[]> | null
      }
    }
  }

  const data = e?.response?.data

  if (data?.errors && !Array.isArray(data.errors)) {
    const firstMessage = Object.values(data.errors)?.[0]?.[0]

    if (firstMessage) return firstMessage
  }

  return (
    data?.detail ??
    data?.message ??
    data?.error ??
    (Array.isArray(data?.errors) ? data?.errors?.[0]?.message : undefined) ??
    data?.title ??
    e?.message ??
    fallback
  )
}
