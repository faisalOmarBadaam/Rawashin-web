import { z } from 'zod'

import {
  baseClientSchema,
} from '@/features/client/schema/baseschema'

import type {
  ClientLookupResponse,
} from '@/features/client/types/responses'

const clientLookupSchema =
  z.custom<ClientLookupResponse>(
    (
      value,
    ): value is ClientLookupResponse =>
      typeof value === 'object' &&
      value !== null &&
      'id' in value,
    {
      message:
        'جهة المستفيد غير صحيحة',
    },
  )

/*
 * هنا نضيف الحقول الخاصة بفورم المستفيد:
 * - Password
 * - ParentClientId
 */
export const beneficiaryBaseSchema =
  baseClientSchema.extend({
    Password: z.string().optional(),

    ParentClientId: clientLookupSchema
      .nullable()
      .optional(),
  })

export type BeneficiaryFormValues =
  z.infer<typeof beneficiaryBaseSchema>

export function getBeneficiaryFormSchema(
  isEdit: boolean,
) {
  return beneficiaryBaseSchema.superRefine(
    (values, context) => {
      // وقت التعديل لا نتحقق من كلمة المرور.
      if (isEdit) return

      const password =
        values.Password ?? ''

      if (password.trim() === '') {
        context.addIssue({
          code: 'custom',
          path: ['Password'],
          message:
            'كلمة المرور مطلوبة',
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