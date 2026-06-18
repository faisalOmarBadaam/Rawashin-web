import { http } from '@/lib/http'
import type {
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  AdminResetPasswordInput,
  ForgotPasswordRequestOTPInput,
  ForgotPasswordVerifyOTPInput,
  ForgotPasswordResetInput,
  ToggleFirstLoginInput
} from '../schema'
import type { AuthResponse } from '../types'
import type { GenericResponse } from '@/shared/types'

export const authEndpoints = {
  register: 'register',
  login: 'auths/login',
  refresh: 'auths/refresh',
  logout: 'auths/logout',
  resetPassword: 'auths/reset-password',
  toggleFirstLogin: 'auths/toggle-first-login',
  adminResetPassword: 'auths/admin-reset-password',
  forgotPasswordRequestOTP: 'auths/forgot-password/request-OTP',
  forgotPasswordVerifyOTP: 'auths/forgot-password/verify-OTP',
  forgotPasswordReset: 'auths/forgot-password/reset',
} as const




export const authApi = {
  register: async (data: RegisterInput): Promise<AuthResponse> => {
    const response = await http.post<AuthResponse>(authEndpoints.register, data)
    return response.data
  },

  login: async (data: LoginInput): Promise<AuthResponse> => {
    const response = await http.post<AuthResponse>(authEndpoints.login, {
      emailOrPhoneNumber: data.phoneNumber.trim(),
      password: data.password,
    })
    return response.data
  },

  refresh: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await http.post<AuthResponse>(authEndpoints.refresh, { refreshToken })
    return response.data
  },

  logout: async (refreshToken?: string): Promise<GenericResponse> => {
    const response = await http.post<GenericResponse>(authEndpoints.logout, refreshToken ? { refreshToken } : undefined)
    return response.data
  },

  resetPassword: async (data: ResetPasswordInput): Promise<GenericResponse> => {
    const response = await http.post<GenericResponse>(authEndpoints.resetPassword, data)
    return response.data
  },

  toggleFirstLogin: async (data: ToggleFirstLoginInput): Promise<GenericResponse> => {
    const response = await http.post<GenericResponse>(authEndpoints.toggleFirstLogin, data)
    return response.data
  },

  adminResetPassword: async (data: AdminResetPasswordInput): Promise<GenericResponse> => {
    const response = await http.post<GenericResponse>(authEndpoints.adminResetPassword, data)
    return response.data
  },

  forgotPasswordRequestOTP: async (data: ForgotPasswordRequestOTPInput): Promise<GenericResponse> => {
    const response = await http.post<GenericResponse>(authEndpoints.forgotPasswordRequestOTP, data)
    return response.data
  },

  forgotPasswordVerifyOTP: async (data: ForgotPasswordVerifyOTPInput): Promise<GenericResponse> => {
    const response = await http.post<GenericResponse>(authEndpoints.forgotPasswordVerifyOTP, data)
    return response.data
  },

  forgotPasswordReset: async (data: ForgotPasswordResetInput): Promise<GenericResponse> => {
    const response = await http.post<GenericResponse>(authEndpoints.forgotPasswordReset, data)
    return response.data
  }
}
