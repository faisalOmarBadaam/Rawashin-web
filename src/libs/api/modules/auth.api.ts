import type {
  AdminResetPasswordRequest,
  AuthResponseDto,
  ForgotPasswordRequestOTPDto,
  ForgotPasswordResetDto,
  ForgotPasswordVerifyOTPDto,
  LoginRequestDto,
  RefreshTokenRequestDto,
  RegisterRequestDto,
  ResetPasswordRequestDto,
} from '@/types/api/auth'
import { endpoints } from '../endpoints'
import { api } from '../service'

export const AuthApi = {
  login(payload: LoginRequestDto) {
    return api.post<AuthResponseDto, LoginRequestDto>(endpoints.auth.login, payload)
  },

  register(payload: RegisterRequestDto) {
    return api.post<AuthResponseDto, RegisterRequestDto>(endpoints.auth.register, payload)
  },

  refresh(payload: RefreshTokenRequestDto) {
    return api.post<AuthResponseDto, RefreshTokenRequestDto>(endpoints.auth.refresh, payload)
  },

  logout() {
    return api.post<unknown, undefined>(endpoints.auth.logout, undefined)
  },

  resetPassword(payload: ResetPasswordRequestDto) {
    return api.post<unknown, ResetPasswordRequestDto>(endpoints.auth.resetPassword, payload)
  },

  toggleFirstLogin(userId: string) {
    return api.request<unknown>('PATCH', endpoints.auth.toggleFirstLogin, undefined, {
      UserId: userId,
    })
  },

  adminResetPassword(userId: string, payload: AdminResetPasswordRequest) {
    return api.request<unknown>('POST', endpoints.auth.adminResetPassword, payload, {
      UserId: userId,
    })
  },

  // Forgot Password Flow
  forgotPasswordRequestOTP(payload: ForgotPasswordRequestOTPDto) {
    return api.post<{ expiresAt: string }, ForgotPasswordRequestOTPDto>(
      endpoints.auth.forgotPasswordRequestOTP,
      payload,
    )
  },

  forgotPasswordVerifyOTP(payload: ForgotPasswordVerifyOTPDto) {
    return api.post<string, ForgotPasswordVerifyOTPDto>(
      endpoints.auth.forgotPasswordVerifyOTP,
      payload,
    )
  },

  forgotPasswordReset(payload: ForgotPasswordResetDto) {
    return api.post<unknown, ForgotPasswordResetDto>(endpoints.auth.forgotPasswordReset, payload)
  },
}
