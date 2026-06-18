import { z } from 'zod'

export const loginSchema = z.object({
	phoneNumber: z.string().trim().min(1, 'رقم الهاتف مطلوب'),
	password: z.string().min(1, 'كلمة المرور مطلوبة'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
	.object({
		phoneNumber: z.string().min(9, 'رقم الهاتف غير صالح'),
		fullName: z.string().min(3, 'الاسم الكامل مطلوب'),
		password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
		confirmPassword: z.string(),
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'كلمات المرور غير متطابقة',
		path: ['confirmPassword'],
	})

export type RegisterInput = z.infer<typeof registerSchema>

export const resetPasswordSchema = z
	.object({
		currentPassword: z.string().min(1, 'كلمة المرور الحالية مطلوبة'),
		newPassword: z.string().min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'),
		confirmNewPassword: z.string(),
	})
	.refine(data => data.newPassword === data.confirmNewPassword, {
		message: 'كلمات المرور الجديدة غير متطابقة',
		path: ['confirmNewPassword'],
	})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

export const adminResetPasswordSchema = z.object({
	userId: z.string().min(1, 'معرف المستخدم مطلوب'),
	newPassword: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
})

export type AdminResetPasswordInput = z.infer<typeof adminResetPasswordSchema>

export const forgotPasswordRequestOTPSchema = z.object({
	email: z.string().email('البريد الإلكتروني غير صالح'),
})

export type ForgotPasswordRequestOTPInput = z.infer<typeof forgotPasswordRequestOTPSchema>

export const forgotPasswordVerifyOTPSchema = z.object({
	email: z.string().email('البريد الإلكتروني غير صالح'),
	otp: z.string().length(6, 'رمز التحقق يتكون من 6 أرقام'),
})

export type ForgotPasswordVerifyOTPInput = z.infer<typeof forgotPasswordVerifyOTPSchema>

export const forgotPasswordResetSchema = z
	.object({
		email: z.string().email('البريد الإلكتروني غير صالح'),
		otp: z.string().length(6, 'رمز التحقق يتكون من 6 أرقام'),
		newPassword: z.string().min(8, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل'),
		confirmNewPassword: z.string(),
	})
	.refine(data => data.newPassword === data.confirmNewPassword, {
		message: 'كلمات المرور الجديدة غير متطابقة',
		path: ['confirmNewPassword'],
	})

export type ForgotPasswordResetInput = z.infer<typeof forgotPasswordResetSchema>

export const toggleFirstLoginSchema = z.object({
	userId: z.string().optional(),
})

export type ToggleFirstLoginInput = z.infer<typeof toggleFirstLoginSchema>

export const authCredentialsSchema = loginSchema
export type AuthCredentials = LoginInput
