// features/client/schema/baseschema.ts

import { z } from 'zod'

const requiredText = (
  label: string,
  maxLength = 50,
) =>
  z
    .string()
    .trim()
    .min(1, `${label} مطلوب`)
    .max(
      maxLength,
      `${label} يجب ألا يتجاوز ${maxLength} حرفًا`,
    )

const NationalIdSchema = z
  .string()
  .trim()
  .min(1, 'رقم الهوية مطلوب')
  .refine(
    (value) =>
      value === '' || /^\d{6,16}$/.test(value),
    {
      message:
        'رقم الهوية يجب أن يتكون من 6 إلى 16 رقمًا',
    },
  )
const PhoneSchema = z
  .string()
  .trim()
  .min(1, 'رقم الهاتف مطلوب')
  .refine(
    (value) => {
      const normalized = value.replace(
        /[\s-]/g,
        '',
      )

      return /^\+?\d{7,15}$/.test(normalized)
    },
    {
      message: 'رقم الهاتف غير صحيح',
    },
  )
export const clientFieldSchemas = {
  FirstName: requiredText('الاسم الأول'),

  SecondName: requiredText('الاسم الثاني'),

  ThirdName: requiredText('الاسم الثالث'),

  LastName: requiredText('الاسم الأخير'),

  NationalId: NationalIdSchema,

  PhoneNumber: PhoneSchema,

  Address: z
    .string()
    .trim()
    .max(
      250,
      'العنوان يجب ألا يتجاوز 250 حرفًا',
    ),

  City: z
    .string()
    .trim()
    .min(1, 'المدينة مطلوبة'),

  NationalIdType: z
    .number()
    .int()
    .nullable()
    .refine(
      (value) =>
        value === null ||
        [1, 2, 3].includes(value),
      {
        message:'نوع الهوية غير صحيح',
      },
    ),
}

export const baseClientSchema = z.object(
  clientFieldSchemas,
)

export type BaseClientFormValues = z.infer<
  typeof baseClientSchema
>