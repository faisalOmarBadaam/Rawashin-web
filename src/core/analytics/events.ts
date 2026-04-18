import type { ResourceKey } from '@/core/rbac/policy'
import type { SmartActionKey, SmartTopbarMode } from '@/core/topbar/smart-topbar.types'
import type { ClientType } from '@/types/api/clients'
import type { UserSession } from '@/contexts/auth/auth.store'

import { getPosthog } from './posthog.client'
import { shouldDisableCaptureForPath } from './privacy'

const APP_NAME = 'rawshin-frontend'
let lastIdentifiedUserId: string | null = null

const sanitizePathname = (pathname: string): string => {
  if (!pathname) return '/'

  return pathname.split('?')[0] || '/'
}

const pickModuleFromPath = (pathname: string): string => {
  const segments = sanitizePathname(pathname).split('/').filter(Boolean)

  if (!segments.length) return 'unknown'

  const first = segments[0]
  const isLang = /^[a-z]{2}(?:-[a-z]{2})?$/i.test(first)

  return segments[isLang ? 1 : 0] ?? 'unknown'
}

const getCurrentPathname = (): string => {
  if (typeof window === 'undefined') return '/'

  return sanitizePathname(window.location.pathname)
}

const getCurrentModule = (): string => {
  return pickModuleFromPath(getCurrentPathname())
}

const capture = (eventName: string, properties: Record<string, unknown>): void => {
  const posthog = getPosthog()

  if (!posthog) return

  posthog.capture(eventName, properties)
}

const cleanMessage = (message: string): string => {
  return message.slice(0, 180)
}

export const trackPageView = ({ pathname, search }: { pathname: string; search?: string }): void => {
  const cleanPathname = sanitizePathname(pathname)
  if (shouldDisableCaptureForPath(cleanPathname)) return

  capture('page_view', {
    pathname: cleanPathname,
    search: search ?? '',
    module: pickModuleFromPath(pathname)
  })
}

export const trackTopbarAction = ({
  actionKey,
  mode,
  module,
  resource,
  clientType
}: {
  actionKey: SmartActionKey
  mode: SmartTopbarMode
  module?: string
  resource?: ResourceKey
  clientType?: ClientType
}): void => {
  capture('topbar_action', {
    action_key: actionKey,
    mode,
    module: module ?? getCurrentModule(),
    resource: resource ?? null,
    client_type: clientType ?? null
  })
}

export const trackRowAction = ({
  actionKey,
  module,
  entityId
}: {
  actionKey: string
  module?: string
  entityId?: string
}): void => {
  capture('row_action', {
    action_key: actionKey,
    module: module ?? getCurrentModule(),
    entity_id: entityId ?? null
  })
}

export const trackEntityCreated = ({
  entityType,
  entityId,
  module
}: {
  entityType: string
  entityId?: string
  module?: string
}): void => {
  capture('entity_created', {
    entity_type: entityType,
    entity_id: entityId ?? null,
    module: module ?? getCurrentModule()
  })
}

export const trackEntityUpdated = ({
  entityType,
  entityId,
  module
}: {
  entityType: string
  entityId?: string
  module?: string
}): void => {
  capture('entity_updated', {
    entity_type: entityType,
    entity_id: entityId ?? null,
    module: module ?? getCurrentModule()
  })
}

export const trackEntityDeleted = ({
  entityType,
  entityId,
  module
}: {
  entityType: string
  entityId?: string
  module?: string
}): void => {
  capture('entity_deleted', {
    entity_type: entityType,
    entity_id: entityId ?? null,
    module: module ?? getCurrentModule()
  })
}

export const trackAttachmentUploaded = ({
  entityType,
  entityId,
  module,
  filesCount
}: {
  entityType: string
  entityId?: string
  module?: string
  filesCount: number
}): void => {
  capture('attachment_uploaded', {
    entity_type: entityType,
    entity_id: entityId ?? null,
    module: module ?? getCurrentModule(),
    files_count: filesCount
  })
}

export const trackRechargeCardPrinted = ({
  entityId,
  module
}: {
  entityId?: string
  module?: string
}): void => {
  capture('recharge_card_printed', {
    entity_id: entityId ?? null,
    module: module ?? getCurrentModule()
  })
}

export const trackError = ({
  area,
  message,
  code
}: {
  area: string
  message: string
  code?: string
}): void => {
  capture('app_error', {
    area,
    code: code ?? null,
    message: cleanMessage(message)
  })
}

export const trackWebVitals = ({
  name,
  value,
  rating,
  url
}: {
  name: string
  value: number
  rating?: 'good' | 'needs-improvement' | 'poor'
  url: string
}): void => {
  capture('web_vitals', {
    name,
    value,
    rating: rating ?? null,
    url: sanitizePathname(url)
  })
}

export const identifySessionUser = (session: UserSession | null): void => {
  const posthog = getPosthog()

  if (!posthog || !session?.userId) return

  const sessionRecord = session as UserSession & {
    clientType?: string | number
    companyCode?: string
  }

  const userId = String(session.userId)
  if (lastIdentifiedUserId === userId) return

  const primaryRole = session.roles?.[0] ?? null

  posthog.identify(userId, {
    app: APP_NAME,
    roles: Array.isArray(session.roles) ? session.roles : [],
    primaryRole,
    clientType: sessionRecord.clientType ?? null,
    companyCode: sessionRecord.companyCode ?? null,
    environment: process.env.NODE_ENV,
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION ?? null
  })

  lastIdentifiedUserId = userId
}

export const resetSessionIdentity = (): void => {
  const posthog = getPosthog()

  posthog?.reset()
  lastIdentifiedUserId = null
}

export const deriveModuleFromPath = (pathname: string): string => {
  return pickModuleFromPath(pathname)
}
