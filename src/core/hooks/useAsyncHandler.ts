import { useCallback, useState } from 'react'

type AsyncState = {
  loading: boolean
  error: string | null
}

type RunOptions = {
  resetError?: boolean
}

type ErrorResolver = (error: unknown) => string

const defaultErrorResolver: ErrorResolver = error => {
  if (error instanceof Error && error.message) return error.message
  if (typeof error === 'string' && error.trim()) return error
  return 'Unexpected error'
}

/**
 * Generic async state helper.
 *
 * Compatibility goals:
 * - Opt-in utility (no behavior changes unless used).
 * - Mirrors existing loading/error flow used across stores.
 */
export const useAsyncHandler = (resolveError: ErrorResolver = defaultErrorResolver) => {
  const [state, setState] = useState<AsyncState>({
    loading: false,
    error: null,
  })

  const run = useCallback(
    async <T>(task: () => Promise<T>, options?: RunOptions): Promise<T> => {
      setState(prev => ({
        ...prev,
        loading: true,
        error: options?.resetError === false ? prev.error : null,
      }))

      try {
        return await task()
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: resolveError(error),
        }))
        throw error
      } finally {
        setState(prev => ({
          ...prev,
          loading: false,
        }))
      }
    },
    [resolveError],
  )

  const resetError = useCallback(() => {
    setState(prev => ({
      ...prev,
      error: null,
    }))
  }, [])

  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
    }))
  }, [])

  return {
    loading: state.loading,
    error: state.error,
    run,
    resetError,
    setError,
  }
}
