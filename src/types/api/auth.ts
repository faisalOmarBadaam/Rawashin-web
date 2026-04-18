import type { ClientType } from './clients'

export interface LoginRequestDto {
  emailOrPhoneNumber?: string | null
  password?: string | null
  deviceNotificationToken?: string | null
}

export interface RefreshTokenRequestDto {
  refreshToken?: string | null
}

export interface RegisterRequestDto {
  email?: string | null
  phoneNumber: string
  password?: string | null
  firstName?: string | null
  secondName?: string | null
  thirdName?: string | null
  lastName?: string | null
  nationalId: string
  organizationName?: string | null
  nationalIdType?: number | null
  address?: string | null
  profilePictureUrl?: string | null
  clientType?: ClientType
  city?: string | null
  parentClientId?: string | null
}

export interface AuthResponseDto {
  accessToken?: string | null
  refreshToken?: string | null
  expiresIn: number
  isFirstLogin?: boolean | null
}

export interface ResetPasswordRequestDto {
  userId: string
  oldPassword?: string | null
  newPassword?: string | null
}

export interface AdminResetPasswordRequest {
  newPassword?: string | null
}

export interface ForgotPasswordRequestOTPDto {
  phoneNumber: string
}

export interface ForgotPasswordVerifyOTPDto {
  phoneNumber: string
  resetPaswordOTP: string
}

export interface ForgotPasswordResetDto {
  phoneNumber: string
  resetPasswordToken: string
  newPassword: string
}
