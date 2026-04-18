import { useCallback, useState } from 'react'

import type { QueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'

type AsyncDialogActionOptions<TPayload, TResult> = {
  action: (payload: TPayload) => Promise<TResult>
  onSuccess?: (result: TResult) => void | Promise<void>
  onError?: (error: unknown) => void | Promise<void>
  onFinally?: () => void | Promise<void>
  invalidate?: Array<readonly unknown[]>
  queryClient?: QueryClient
  successMessage?: string
  errorMessage?: string
  closeOnSuccess?: () => void
  resetOnSuccess?: () => void
}

export const useAsyncDialogAction = <TPayload, TResult>(
  options: AsyncDialogActionOptions<TPayload, TResult>,
) => {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = useCallback(
    async (payload: TPayload) => {
      setSubmitting(true)
      setError(null)

      try {
        const result = await options.action(payload)

        if (options.queryClient && options.invalidate?.length) {
          await Promise.all(
            options.invalidate.map(queryKey =>
              options.queryClient!.invalidateQueries({ queryKey }),
            ),
          )
        }

        if (options.successMessage) {
          toast.success(options.successMessage)
        }

        await options.onSuccess?.(result)
        options.resetOnSuccess?.()
        options.closeOnSuccess?.()

        return result
      } catch (e) {
        const message =
          e instanceof Error ? e.message : (options.errorMessage ?? 'حدث خطأ غير متوقع')
        setError(message)

        if (options.errorMessage) {
          toast.error(options.errorMessage)
        } else {
          toast.error(message)
        }

        await options.onError?.(e)
        throw e
      } finally {
        setSubmitting(false)
        await options.onFinally?.()
      }
    },
    [options],
  )

  return {
    submit,
    submitting,
    error,
    clearError: () => setError(null),
  }
}
