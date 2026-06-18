import type {
  FieldValues,
  Path,
  UseFormSetError,
} from 'react-hook-form'

import type { ServerFieldErrors } from '@/shared/apis/server-problem-details'

function getFirstMessage(messages: string[] | undefined) {
  return messages?.[0]
}

export function applyServerErrors<TFormValues extends FieldValues>(
  serverErrors: ServerFieldErrors | undefined,
  setError: UseFormSetError<TFormValues>
) {
  if (!serverErrors) return false

  let hasAppliedErrors = false

  Object.entries(serverErrors).forEach(([fieldName, messages]) => {
    const message = getFirstMessage(messages)

    if (!message) return

    setError(
      fieldName as Path<TFormValues>,
      {
        type: 'server',
        message,
      },
      {
        shouldFocus: !hasAppliedErrors,
      }
    )

    hasAppliedErrors = true
  })

  return hasAppliedErrors
}