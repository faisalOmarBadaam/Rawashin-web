import { z } from 'zod'

export const loginSchema = z.object({
  emailOrPhoneNumber: z.string().min(1, { message: 'البريد الإلكتروني أو رقم الهاتف مطلوب' }),
  password: z.string().min(1, { message: 'كلمة المرور مطلوبة' }),
})

// Schema for Register
export const registerSchema = z.object({
  email: z.string().email({ message: 'البريد الإلكتروني غير صالح' }).optional().or(z.literal('')),
  phoneNumber: z
    .string()
    .min(1, { message: 'رقم الهاتف مطلوب' })
    .regex(/^7\d{8}$/, { message: 'صيغة رقم الهاتف غير صحيحة' }),
  password: z
    .string()
    .min(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
    .optional()
    .or(z.literal('')),
  firstName: z.string().optional().or(z.literal('')),
  secondName: z.string().optional(),
  thirdName: z.string().optional(),
  lastName: z.string().optional().or(z.literal('')),
  nationalId: z.string().min(1, { message: 'رقم الهوية مطلوب' }),
  address: z.string().optional().or(z.literal('')),
  profilePictureUrl: z.string().optional(),

  // clientType is strictly 0 per request, handled by default value or hidden field
  clientType: z.number(),
  city: z.string().optional().or(z.literal('')),
})

export type RegisterSchema = z.infer<typeof registerSchema>

export type LoginSchema = z.infer<typeof loginSchema>
