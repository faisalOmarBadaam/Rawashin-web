import { z } from 'zod'

import {
  baseClientSchema,
} from '@/features/client/schema/baseschema'

export const userBaseSchema =
  baseClientSchema.extend({
    Password: z.string().optional(),
  })

export type UserFormValues = z.infer<
  typeof userBaseSchema
>

export function getUserFormSchema(
  isEdit: boolean,
) {
  return userBaseSchema.superRefine(
    (values, context) => {
      if (isEdit) return

      const password = values.Password ?? ''

      if (password.trim() === '') {
        context.addIssue({
          code: 'custom',
          path: ['Password'],
          message: 'كلمة المرور مطلوبة',
        })

        return
      }

      if (password.length < 8) {
        context.addIssue({
          code: 'custom',
          path: ['Password'],
          message:
            'كلمة المرور يجب ألا تقل عن 8 أحرف',
        })
      }
    },
  )
}