import { create } from 'zustand'

import { resetSessionIdentity } from '@/core/analytics/events'

export type UserSession = {
  userId: string
  email?: string
  name?: string
  roles: string[]
  clientType?: string | number
  companyCode?: string
  accessToken?: string
  refreshToken?: string
  expiresIn: number
}

type AuthState = {
  session: UserSession | null
  isAuthenticated: boolean
  login: (session: UserSession) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>(set => ({
  session: null,
  isAuthenticated: false,

  login: session => {
    set({ session, isAuthenticated: true })
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      resetSessionIdentity()
    }

    set({ session: null, isAuthenticated: false })
  }
}))
