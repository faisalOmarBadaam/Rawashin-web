import { z } from 'zod'

import {
  baseClientSchema,
} from '@/features/client/schema/baseschema'

export const partnerBaseSchema =
  baseClientSchema.extend({
    Password: z.string().optional(),

    NationalIdType: z
      .number({
        message: 'نوع الهوية مطلوب',
      })
      .int('نوع الهوية غير صحيح'),

    OrganizationName: z
      .string()
      .trim()
      .min(1, 'اسم المنشأة مطلوب')
      .max(
        150,
        'اسم المنشأة يجب ألا يتجاوز 150 حرفًا',
      ),
  })

export type PartnerFormValues = z.infer<
  typeof partnerBaseSchema
>

export function getPartnerFormSchema(
  isEdit: boolean,
) {
  return partnerBaseSchema.superRefine(
    (values, context) => {
      // كلمة المرور غير مطلوبة وقت التعديل.
      if (isEdit) return

      const password =
        values.Password?.trim() ?? ''

      if (password === '') {
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