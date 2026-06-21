import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authApi } from '../api'
import { loginSchema, type LoginInput } from '../schema'
import { clearAuthSession, getRefreshToken, storeAuthSession } from '../utils/session'

// Form hook wrapper (retained for backward compatibility or direct usage)
export function useAuthForm(initialValues?: Partial<LoginInput>) {
  const [credentials, setCredentials] = useState<LoginInput>(() => loginSchema.parse(initialValues ?? { email: '', password: '' }))

  const resetCredentials = () => {
    setCredentials(loginSchema.parse({ email: '', password: '' }))
  }

  return {
    credentials,
    setCredentials,
    resetCredentials,
  }
}

/**
 * 1. Register Mutation Hook
 */
export function useRegister() {
  return useMutation({
    mutationFn: authApi.register,
    onSuccess: (data) => {
      storeAuthSession(data)
    }
  })
}

/**
 * 2. Login Mutation Hook
 */
export function useLogin() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      storeAuthSession(data)
      queryClient.invalidateQueries()
    }
  })
}

/**
 * 3. Refresh Mutation Hook
 */
export function useRefresh() {
  return useMutation({
    mutationFn: authApi.refresh,
    onSuccess: (data) => {
      storeAuthSession(data)
    }
  })
}

/**
 * 4. Logout Mutation Hook
 */
export function useLogout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => authApi.logout(getRefreshToken() ?? undefined),
    onSuccess: () => {
      clearAuthSession()
      queryClient.clear()
    },
    onError: () => {
      // Clear token anyway to prevent session locking
      clearAuthSession()
      queryClient.clear()
    }
  })
}

// /**
//  * 5. Reset Password Mutation Hook
//  */
// export function useResetPassword() {
//   return useMutation({
//     mutationFn: authApi.resetPassword
//   })
// }

// /**
//  * 6. Toggle First Login Mutation Hook
//  */
// export function useToggleFirstLogin() {
//   return useMutation({
//     mutationFn: authApi.toggleFirstLogin
//   })
// }

// /**
//  * 7. Admin Reset Password Mutation Hook
//  */
// export function useAdminResetPassword() {
//   return useMutation({
//     mutationFn: authApi.adminResetPassword
//   })
// }

// /**
//  * 8. Forgot Password Request OTP Mutation Hook
//  */
// export function useForgotPasswordRequestOTP() {
//   return useMutation({
//     mutationFn: authApi.forgotPasswordRequestOTP
//   })
// }

// /**
//  * 9. Forgot Password Verify OTP Mutation Hook
//  */
// export function useForgotPasswordVerifyOTP() {
//   return useMutation({
//     mutationFn: authApi.forgotPasswordVerifyOTP
//   })
// }

// /**
//  * 10. Forgot Password Reset Mutation Hook
//  */
// export function useForgotPasswordReset() {
//   return useMutation({
//     mutationFn: authApi.forgotPasswordReset
//   })
// }
