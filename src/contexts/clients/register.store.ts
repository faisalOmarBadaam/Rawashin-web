import { create } from 'zustand'

import { AuthApi } from '@/libs/api/modules/auth.api'
import type { RegisterRequestDto, AdminResetPasswordRequest } from '@/types/api/auth'
import { trackEntityCreated } from '@/core/analytics/events'

type RegisterState = {
  loading: boolean
  error: string | null
  success: boolean

  register: (payload: RegisterRequestDto) => Promise<any>
  adminResetPassword: (userId: string, payload: AdminResetPasswordRequest) => Promise<void>

  reset: () => void
}

export const useRegisterStore = create<RegisterState>(set => ({
  loading: false,
  error: null,
  success: false,

  register: async payload => {
    set({ loading: true, error: null, success: false })

    try {
      const res = await AuthApi.register(payload)

      const entityType = payload.clientType === undefined ? 'user' : 'client'

      trackEntityCreated({
        entityType,
        module: entityType === 'user' ? 'users' : 'clients'
      })

      set({
        loading: false,
        success: true
      })

      return res
    } catch (e: any) {
      set({
        loading: false,
        error: e?.response?.data?.detail ?? e?.message ?? 'فشل إنشاء المستخدم'
      })

      throw e
    }
  },

  adminResetPassword: async (userId, payload) => {
    set({ loading: true, error: null, success: false })

    try {
      await AuthApi.adminResetPassword(userId, payload)

      set({
        loading: false,
        success: true
      })
    } catch (e: any) {
      set({
        loading: false,
        error: e?.response?.data?.detail ?? e?.message ?? 'فشل إعادة تعيين كلمة المرور'
      })

      throw e
    }
  },

  reset: () => {
    set({
      loading: false,
      error: null,
      success: false
    })
  }
}))
