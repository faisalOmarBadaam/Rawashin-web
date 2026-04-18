import { create } from 'zustand'

import { NotificationsApi } from '@/libs/api/modules/notifications.api'

import type { SendToAllNotificationRequestDto } from '@/types/api/notifications'

type NotificationsState = {
  sendingToAll: boolean
  error: string | null

  sendToAll: (payload: SendToAllNotificationRequestDto) => Promise<void>
}

export const useNotificationsStore = create<NotificationsState>(set => ({
  sendingToAll: false,
  error: null,

  sendToAll: async payload => {
    set({ sendingToAll: true, error: null })

    try {
      await NotificationsApi.sendToAll(payload)
      set({ sendingToAll: false })
    } catch (e: any) {
      set({ sendingToAll: false, error: e?.message ?? 'Failed to send notification' })
      throw e
    }
  }
}))
