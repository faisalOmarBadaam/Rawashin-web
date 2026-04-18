import type { HubConnection } from '@microsoft/signalr'
import { HubConnectionBuilder, HttpTransportType, LogLevel } from '@microsoft/signalr'

import { apiConfig } from '@/libs/api/config'
import { tokenStore } from '@/libs/api/tokenStore'

export const SUPPORT_TICKETS_HUB_PATH = '/hubs/support-tickets'

const joinUrl = (baseUrl: string, path: string): string => {
  const normalizedBase = baseUrl.replace(/\/+$/, '')
  const normalizedPath = path.startsWith('/') ? path : `/${path}`

  return `${normalizedBase}${normalizedPath}`
}

export const getSupportTicketsHubUrl = (baseUrl?: string): string => {
  const resolvedBaseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || apiConfig.baseURL
  return joinUrl(resolvedBaseUrl, SUPPORT_TICKETS_HUB_PATH)
}

export const createSupportTicketsHubConnection = (): HubConnection => {
  const url = getSupportTicketsHubUrl()

  return new HubConnectionBuilder()
    .withUrl(url, {
      accessTokenFactory: () => tokenStore.getAccessToken() ?? '',
      withCredentials: apiConfig.withCredentials,
      transport:
        HttpTransportType.WebSockets |
        HttpTransportType.ServerSentEvents |
        HttpTransportType.LongPolling
    })
    .withAutomaticReconnect([0, 2000, 10_000, 30_000])
    .configureLogging(process.env.NODE_ENV === 'development' ? LogLevel.Information : LogLevel.Warning)
    .build()
}
