import { api } from '../service'
import { endpoints } from '../endpoints'

import type { SendToAllNotificationRequestDto } from '@/types/api/notifications'

export const NotificationsApi = {
  sendToAll: (payload: SendToAllNotificationRequestDto) =>
    api.post<void, SendToAllNotificationRequestDto>(endpoints.notifications.sendToAll, payload)
}
