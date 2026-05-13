import { z } from 'zod'

import type { ClientVariant } from '@/domains/clients/variants/clientVariants'
import { ClientType } from '@/types/api/clients'

export type RegisterFormMode = 'add' | 'edit' | 'view'

const passwordSchema = z
  .string()
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف إنجليزي كبير')
  .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل')

const lookupSchema = z.object({
  id: z.union([z.string(), z.number()]),
  name: z.string(),
})

export const baseRegisterSchema = z.object({
  email: z.string().email('بريد إلكتروني غير صالح').optional().or(z.literal('')),

  phoneNumber: z
    .string()
    .nonempty('رقم الهاتف مطلوب')
    .regex(/^7\d{8}$/, 'رقم الهاتف يجب أن يتكون من 9 أرقام ويبدأ بالرقم 7'),

  password: z.union([passwordSchema, z.literal('')]).optional(),

  firstName: z.string().min(2, 'الاسم الأول مطلوب'),
  secondName: z.string().min(2, 'الاسم الثاني مطلوب'),
  thirdName: z.string().min(2, 'الاسم الثالث مطلوب'),
  lastName: z.string().min(2, 'اسم العائلة مطلوب'),

  nationalId: z.string().optional(),
  organizationName: z.string().optional().or(z.literal('')),
  nationalIdType: z.union([z.literal(0), z.literal(1), z.literal(2)]).optional(),
  address: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),

  profilePictureUrl: z.string().nullable().optional(),

  parentClientId: lookupSchema.nullable().optional(),
})

const IDENTITY_CONFIG = {
  0: {
    label: 'رقم البطاقة الشخصية',
    regex: /^\d{8,15}$/,
    message: 'رقم البطاقة يجب أن يكون أرقام فقط من 8 إلى 15 رقم',
    requiredMessage: 'رقم البطاقة الشخصية مطلوب',
  },
  1: {
    label: 'رقم جواز السفر',
    regex: /^\d{8,15}$/,
    message: 'رقم الجواز يجب أن يكون أرقام فقط من 8 إلى 15 رقم',
    requiredMessage: 'رقم جواز السفر مطلوب',
  },
  2: {
    label: 'رقم السجل التجاري',
    regex: /^\d{8,15}$/,
    message: 'رقم السجل التجاري يجب أن يكون أرقام فقط من 8 إلى 15 رقم',
    requiredMessage: 'رقم السجل التجاري مطلوب',
  },
} as const

export const getRegisterSchema = (mode: RegisterFormMode, clientType?: ClientType) =>
  baseRegisterSchema.superRefine((values, ctx) => {
    if (mode !== 'add') return

    if (!values.password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'كلمة المرور مطلوبة',
        path: ['password'],
      })
    }

    const config = IDENTITY_CONFIG[values.nationalIdType ?? 0]

    if (!values.nationalId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: config.requiredMessage,
        path: ['nationalId'],
      })
    } else {
      const id = values.nationalId.trim()

      if (!config.regex.test(id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: config.message,
          path: ['nationalId'],
        })
      }
    }

    if (
      clientType !== undefined &&
      (clientType === ClientType.Charger ||
        clientType === ClientType.ProfitAccount ||
        clientType === ClientType.Employee) &&
      !values.parentClientId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'الحساب الرئيسي مطلوب',
        path: ['parentClientId'],
      })
    }
  })

export const getRegisterSchemaForVariant = (
  mode: RegisterFormMode,
  clientType?: ClientType,
  variant?: ClientVariant,
) =>
  getRegisterSchema(mode, clientType).superRefine((values, ctx) => {
    if (mode !== 'add' || variant !== 'merchants') return

    if (!values.address?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'العنوان مطلوب',
        path: ['address'],
      })
    }

    if (!values.city?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'المدينة مطلوبة',
        path: ['city'],
      })
    }
  })

export type RegisterFormValues = z.infer<typeof baseRegisterSchema>
