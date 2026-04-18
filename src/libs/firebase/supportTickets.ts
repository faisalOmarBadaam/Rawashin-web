'use client'

import {
  Timestamp,
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
  type CollectionReference,
  type DocumentData,
  type DocumentReference,
  type DocumentSnapshot,
  type Firestore,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
  type Unsubscribe,
} from 'firebase/firestore'

import { useAuthStore } from '@/contexts/auth/auth.store'

import type {
  CreateSupportTicketMessageDto,
  SupportTicketCreateRequestDto,
  SupportTicketDetailsDto,
  SupportTicketDto,
  SupportTicketMessageDto,
  SupportTicketMessagesQueryParams,
  SupportTicketStatus,
  SupportTicketsPagedResult,
  SupportTicketsQueryParams,
} from '@/types/api/supportTickets'

import { SupportTicketMessageSenderType } from '@/types/api/supportTickets'

import { getFirebaseApp } from './app'

type UserProfile = {
  id: string
  name: string | null
  phoneNumber: string | null
}

type TicketDocument = {
  id?: string
  clientId?: string | null
  clientName?: string | null
  clientPhoneNumber?: string | null
  subject?: string | null
  title?: string | null
  description?: string | null
  category?: number | null
  status?: number | null
  createdAt?: unknown
  updatedAt?: unknown
  completedAt?: unknown
  supporterId?: string | null
}

type MessageDocument = {
  id?: string
  clientId?: string | null
  senderName?: string | null
  senderType?: number | string | null
  content?: string | null
  message?: string | null
  createdAt?: unknown
  seenAt?: unknown
  deliveredAt?: unknown
}

const USERS_COLLECTION = 'users'
const SUPPORT_TICKETS_COLLECTION = 'support-tickets'
const MESSAGES_COLLECTION = 'messages'

const getFirestoreDb = (): Firestore => {
  const app = getFirebaseApp()

  if (!app) {
    throw new Error('Firebase configuration is incomplete')
  }

  return getFirestore(app)
}

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? (value as Record<string, unknown>) : {}

const toNullableString = (value: unknown): string | null => {
  if (value === null || value === undefined) return null

  const text = String(value).trim()

  return text ? text : null
}

const toNullableNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value)

    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

const toIsoDateString = (value: unknown): string | null => {
  if (!value) return null
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  if (value instanceof Timestamp) return value.toDate().toISOString()

  const maybeTimestamp = asRecord(value)

  if (typeof maybeTimestamp.toDate === 'function') {
    try {
      const date = maybeTimestamp.toDate() as Date
      return date.toISOString()
    } catch {
      return null
    }
  }

  return null
}

const normalizeText = (value?: string | null) => value?.trim().toLowerCase() ?? ''

const buildFullName = (record: Record<string, unknown>): string | null => {
  const explicitName =
    toNullableString(record.fullName) ??
    toNullableString(record.organizationName) ??
    toNullableString(record.name) ??
    toNullableString(record.displayName)

  if (explicitName) return explicitName

  const parts = [record.firstName, record.secondName, record.thirdName, record.lastName]
    .map(toNullableString)
    .filter((part): part is string => Boolean(part))

  return parts.length > 0 ? parts.join(' ') : null
}

const getCurrentUserName = () => {
  const session = useAuthStore.getState().session

  return session?.name?.trim() || session?.email?.trim() || null
}

const getRequiredClientId = (clientId?: string | null) => {
  const resolvedClientId = clientId ?? useAuthStore.getState().session?.userId ?? null

  if (!resolvedClientId) {
    throw new Error('Client id is required for support ticket access')
  }

  return resolvedClientId
}

const getTicketCollection = (db: Firestore, clientId: string): CollectionReference<DocumentData> =>
  collection(db, USERS_COLLECTION, clientId, SUPPORT_TICKETS_COLLECTION)

const getTicketReference = (
  db: Firestore,
  clientId: string,
  ticketId: string,
): DocumentReference<DocumentData> =>
  doc(db, USERS_COLLECTION, clientId, SUPPORT_TICKETS_COLLECTION, ticketId)

const getMessagesCollection = (
  db: Firestore,
  clientId: string,
  ticketId: string,
): CollectionReference<DocumentData> =>
  collection(
    db,
    USERS_COLLECTION,
    clientId,
    SUPPORT_TICKETS_COLLECTION,
    ticketId,
    MESSAGES_COLLECTION,
  )

const getUserReference = (db: Firestore, clientId: string): DocumentReference<DocumentData> =>
  doc(db, USERS_COLLECTION, clientId)

const readUserProfile = async (
  db: Firestore,
  clientId?: string | null,
): Promise<UserProfile | null> => {
  if (!clientId) return null

  const snapshot = await getDoc(getUserReference(db, clientId))

  if (!snapshot.exists()) {
    return { id: clientId, name: null, phoneNumber: null }
  }

  const data = asRecord(snapshot.data())

  return {
    id: clientId,
    name: buildFullName(data),
    phoneNumber:
      toNullableString(data.phoneNumber) ??
      toNullableString(data.mobile) ??
      toNullableString(data.cellPhone),
  }
}

const hydrateUserProfiles = async (db: Firestore, tickets: TicketDocument[]) => {
  const clientIds = Array.from(
    new Set(
      tickets
        .map(ticket => toNullableString(ticket.clientId))
        .filter((value): value is string => Boolean(value)),
    ),
  )

  const entries = await Promise.all(
    clientIds.map(async clientId => [clientId, await readUserProfile(db, clientId)] as const),
  )

  return new Map(entries)
}

const mapTicket = (
  snapshot: DocumentSnapshot<DocumentData>,
  profile?: UserProfile | null,
): SupportTicketDto => {
  const data = snapshot.data() as TicketDocument | undefined

  if (!data) {
    throw new Error('Ticket document is empty')
  }

  const clientId = toNullableString(data.clientId) ?? snapshot.ref.parent.parent?.id ?? null

  return {
    id: toNullableString(data.id) ?? snapshot.id,
    clientId,
    title: toNullableString(data.title),
    subject: toNullableString(data.subject) ?? toNullableString(data.title),
    description: toNullableString(data.description),
    createdAt: toIsoDateString(data.createdAt),
    updatedAt: toIsoDateString(data.updatedAt),
    category: toNullableNumber(data.category),
    status: toNullableNumber(data.status),
    clientName:
      toNullableString(data.clientName) ?? profile?.name ?? (clientId ? `#${clientId}` : null),
    clientPhoneNumber: toNullableString(data.clientPhoneNumber) ?? profile?.phoneNumber,
  }
}

const mapTicketDetails = (
  snapshot: DocumentSnapshot<DocumentData>,
  profile?: UserProfile | null,
): SupportTicketDetailsDto => {
  const ticket = mapTicket(snapshot, profile)

  return {
    id: ticket.id,
    clientId: ticket.clientId,
    clientName: ticket.clientName,
    clientPhoneNumber: ticket.clientPhoneNumber,
    subject: ticket.subject,
    description: ticket.description,
    category: ticket.category,
    status: ticket.status,
    createdAt: ticket.createdAt,
  }
}

const mapMessage = (
  ticketId: string,
  snapshot: QueryDocumentSnapshot<DocumentData>,
): SupportTicketMessageDto => {
  const data = snapshot.data() as MessageDocument

  return {
    id: toNullableString(data.id) ?? snapshot.id,
    ticketId,
    senderName: toNullableString(data.senderName),
    senderType: (toNullableNumber(data.senderType) ??
      SupportTicketMessageSenderType.Client) as SupportTicketMessageSenderType,
    message: toNullableString(data.message) ?? toNullableString(data.content) ?? '',
    createdAt: toIsoDateString(data.createdAt),
    seenAt: toIsoDateString(data.seenAt),
  }
}

const sortTickets = (items: SupportTicketDto[], queryParams?: SupportTicketsQueryParams) => {
  const sortBy = queryParams?.SortBy ?? 'createdAt'
  const sortDesc = queryParams?.SortDir === 'desc' || queryParams?.IsDesc === true

  return [...items].sort((left, right) => {
    const leftValue = left[sortBy as keyof SupportTicketDto]
    const rightValue = right[sortBy as keyof SupportTicketDto]

    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      const leftTime = leftValue ? new Date(String(leftValue)).getTime() : 0
      const rightTime = rightValue ? new Date(String(rightValue)).getTime() : 0

      return sortDesc ? rightTime - leftTime : leftTime - rightTime
    }

    if (typeof leftValue === 'number' || typeof rightValue === 'number') {
      const leftNumber = typeof leftValue === 'number' ? leftValue : -1
      const rightNumber = typeof rightValue === 'number' ? rightValue : -1

      return sortDesc ? rightNumber - leftNumber : leftNumber - rightNumber
    }

    const leftText = normalizeText(leftValue as string | null | undefined)
    const rightText = normalizeText(rightValue as string | null | undefined)

    if (leftText === rightText) return 0

    const comparison = leftText.localeCompare(rightText, 'ar')

    return sortDesc ? -comparison : comparison
  })
}

const filterTickets = (items: SupportTicketDto[], queryParams?: SupportTicketsQueryParams) => {
  const search = normalizeText(queryParams?.Search)

  return items.filter(ticket => {
    if (queryParams?.Category !== undefined && ticket.category !== queryParams.Category) {
      return false
    }

    if (queryParams?.Status !== undefined && ticket.status !== queryParams.Status) {
      return false
    }

    if (!search) return true

    const haystack = [ticket.subject, ticket.title, ticket.description, ticket.clientName]
      .map(normalizeText)
      .join(' ')

    return haystack.includes(search)
  })
}

const paginateTickets = (
  items: SupportTicketDto[],
  queryParams?: SupportTicketsQueryParams,
): SupportTicketsPagedResult => {
  const pageNumber = Math.max(queryParams?.PageNumber ?? 1, 1)
  const pageSize = Math.max(queryParams?.PageSize ?? 20, 1)
  const totalCount = items.length
  const totalPages = Math.max(Math.ceil(totalCount / pageSize), 1)
  const start = (pageNumber - 1) * pageSize
  const pagedItems = items.slice(start, start + pageSize)

  return {
    items: pagedItems,
    totalCount,
    pageNumber,
    pageSize,
    totalPages,
    hasPrevious: pageNumber > 1,
    hasNext: pageNumber < totalPages,
  }
}

const resolveTicketContext = async (db: Firestore, ticketId: string, clientId?: string | null) => {
  const resolvedClientId = getRequiredClientId(clientId)
  const snapshot = await getDoc(getTicketReference(db, resolvedClientId, ticketId))

  if (!snapshot.exists()) {
    throw new Error('Support ticket not found')
  }

  return {
    snapshot,
    clientId: resolvedClientId,
  }
}

const mapPagedTicketsFromSnapshot = async (
  db: Firestore,
  snapshot: QuerySnapshot<DocumentData>,
  queryParams?: SupportTicketsQueryParams,
) => {
  const ticketDocs = snapshot.docs.map(item => item.data() as TicketDocument)
  const profiles = await hydrateUserProfiles(db, ticketDocs)

  const items = snapshot.docs.map(item => {
    const ticketData = item.data() as TicketDocument
    const clientId = toNullableString(ticketData.clientId)

    return mapTicket(item, clientId ? (profiles.get(clientId) ?? null) : null)
  })

  return paginateTickets(sortTickets(filterTickets(items, queryParams), queryParams), queryParams)
}

const mapMessagesSnapshot = (
  ticketId: string,
  snapshot: QuerySnapshot<DocumentData>,
  queryParams?: SupportTicketMessagesQueryParams,
): SupportTicketMessageDto[] => {
  const sortDesc = queryParams?.SortDir === 'desc' || queryParams?.IsDesc === true
  const search = normalizeText(queryParams?.Search)
  const pageNumber = Math.max(queryParams?.PageNumber ?? 1, 1)
  const pageSize = Math.max(queryParams?.PageSize ?? 200, 1)
  const start = (pageNumber - 1) * pageSize

  const items = snapshot.docs
    .map(item => mapMessage(ticketId, item))
    .filter(message => {
      if (!search) return true
      return normalizeText(message.message).includes(search)
    })

  const sorted = items.sort((left, right) => {
    const leftTime = left.createdAt ? new Date(left.createdAt).getTime() : 0
    const rightTime = right.createdAt ? new Date(right.createdAt).getTime() : 0

    return sortDesc ? rightTime - leftTime : leftTime - rightTime
  })

  return sorted.slice(start, start + pageSize)
}

export const supportTicketsFirebase = {
  async create(payload: SupportTicketCreateRequestDto) {
    const db = getFirestoreDb()
    const ticketId = Date.now().toString()
    const now = Timestamp.now()
    const profile = await readUserProfile(db, payload.clientId)

    await setDoc(getTicketReference(db, payload.clientId, ticketId), {
      id: ticketId,
      clientId: payload.clientId,
      clientName: profile?.name ?? null,
      clientPhoneNumber: profile?.phoneNumber ?? null,
      subject: toNullableString(payload.subject),
      title: toNullableString(payload.subject),
      description: toNullableString(payload.description),
      category: payload.category,
      status: 0,
      supporterId: null,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    })
  },

  async getAll(queryParams?: SupportTicketsQueryParams) {
    const db = getFirestoreDb()
    const snapshot = await getDocs(collectionGroup(db, SUPPORT_TICKETS_COLLECTION))
    return mapPagedTicketsFromSnapshot(db, snapshot, queryParams)
  },

  async getByClientId(clientId: string, queryParams?: SupportTicketsQueryParams) {
    const db = getFirestoreDb()
    const snapshot = await getDocs(getTicketCollection(db, clientId))
    const profile = await readUserProfile(db, clientId)
    const items = snapshot.docs.map(item => mapTicket(item, profile))

    return paginateTickets(sortTickets(filterTickets(items, queryParams), queryParams), queryParams)
  },

  async getById(ticketId: string, clientId?: string | null) {
    const db = getFirestoreDb()
    const { snapshot, clientId: resolvedClientId } = await resolveTicketContext(
      db,
      ticketId,
      clientId,
    )
    const profile = await readUserProfile(db, resolvedClientId)

    return mapTicketDetails(snapshot, profile)
  },

  async updateStatus(ticketId: string, status: SupportTicketStatus, clientId?: string | null) {
    const db = getFirestoreDb()
    const { snapshot, clientId: resolvedClientId } = await resolveTicketContext(
      db,
      ticketId,
      clientId,
    )
    const now = Timestamp.now()
    const supporterId = useAuthStore.getState().session?.userId ?? null

    await updateDoc(snapshot.ref, {
      status,
      updatedAt: now,
      completedAt: status === 2 ? now : null,
      supporterId,
    })

    const profile = await readUserProfile(db, resolvedClientId)
    const refreshed = await getDoc(snapshot.ref)

    if (!refreshed.exists()) {
      throw new Error('Support ticket not found after update')
    }

    return mapTicketDetails(refreshed, profile)
  },

  async getMessages(
    ticketId: string,
    queryParams?: SupportTicketMessagesQueryParams,
    clientId?: string | null,
  ) {
    const db = getFirestoreDb()
    const { clientId: resolvedClientId } = await resolveTicketContext(db, ticketId, clientId)

    const messagesQuery = query(
      getMessagesCollection(db, resolvedClientId, ticketId),
      orderBy('createdAt', 'asc'),
    )

    const snapshot = await getDocs(messagesQuery)

    return mapMessagesSnapshot(ticketId, snapshot, queryParams)
  },

  async createMessage(
    ticketId: string,
    payload: CreateSupportTicketMessageDto,
    clientId?: string | null,
  ) {
    const db = getFirestoreDb()
    const { snapshot, clientId: resolvedClientId } = await resolveTicketContext(
      db,
      ticketId,
      clientId,
    )
    const ticket = snapshot.data() as TicketDocument
    const messageId = Date.now().toString()
    const now = Timestamp.now()

    const shouldMoveToInProgress =
      payload.senderType === SupportTicketMessageSenderType.Support &&
      toNullableNumber(ticket.status) === 0

    await setDoc(doc(getMessagesCollection(db, resolvedClientId, ticketId), messageId), {
      id: messageId,
      clientId: resolvedClientId,
      senderName: getCurrentUserName(),
      senderType: payload.senderType,
      content: toNullableString(payload.message),
      createdAt: now,
      deliveredAt: now,
      seenAt: null,
    })

    await updateDoc(snapshot.ref, {
      updatedAt: now,
      status: shouldMoveToInProgress ? 1 : (ticket.status ?? null),
      supporterId:
        payload.senderType === SupportTicketMessageSenderType.Support
          ? (useAuthStore.getState().session?.userId ?? null)
          : (ticket.supporterId ?? null),
    })

    return {
      id: messageId,
      ticketId,
      senderName: getCurrentUserName(),
      senderType: payload.senderType,
      message: toNullableString(payload.message) ?? '',
      createdAt: now.toDate().toISOString(),
      seenAt: null,
    }
  },

  async markMessagesAsRead(ticketId: string, clientId?: string | null) {
    const db = getFirestoreDb()
    const { clientId: resolvedClientId } = await resolveTicketContext(db, ticketId, clientId)

    const messagesQuery = query(
      getMessagesCollection(db, resolvedClientId, ticketId),
      orderBy('createdAt', 'asc'),
    )

    const snapshot = await getDocs(messagesQuery)

    const unreadClientMessages = snapshot.docs.filter(item => {
      const message = mapMessage(ticketId, item)
      return message.senderType === SupportTicketMessageSenderType.Client && !message.seenAt
    })

    if (unreadClientMessages.length === 0) return

    const batch = writeBatch(db)
    const now = Timestamp.now()

    unreadClientMessages.forEach(item => {
      batch.update(item.ref, { seenAt: now })
    })

    await batch.commit()
  },

  subscribeAll(
    queryParams: SupportTicketsQueryParams | undefined,
    onData: (data: SupportTicketsPagedResult) => void,
    onError?: (error: Error) => void,
  ): Unsubscribe {
    const db = getFirestoreDb()
    const ticketsQuery = collectionGroup(db, SUPPORT_TICKETS_COLLECTION)

    return onSnapshot(
      ticketsQuery,
      snapshot => {
        void mapPagedTicketsFromSnapshot(db, snapshot, queryParams)
          .then(onData)
          .catch(error =>
            onError?.(error instanceof Error ? error : new Error('Failed to sync support tickets')),
          )
      },
      error => onError?.(error),
    )
  },

  subscribeById(
    ticketId: string,
    onData: (ticket: SupportTicketDetailsDto | null) => void,
    onError?: (error: Error) => void,
    clientId?: string | null,
  ): Unsubscribe {
    const db = getFirestoreDb()
    const resolvedClientId = getRequiredClientId(clientId)
    const ticketRef = getTicketReference(db, resolvedClientId, ticketId)

    return onSnapshot(
      ticketRef,
      async snapshot => {
        try {
          if (!snapshot.exists()) {
            onData(null)
            return
          }

          const profile = await readUserProfile(db, resolvedClientId)
          onData(mapTicketDetails(snapshot, profile))
        } catch (error) {
          onError?.(error instanceof Error ? error : new Error('Failed to sync support ticket'))
        }
      },
      error => onError?.(error),
    )
  },

  async subscribeMessages(
    ticketId: string,
    queryParams: SupportTicketMessagesQueryParams | undefined,
    onData: (messages: SupportTicketMessageDto[]) => void,
    onError?: (error: Error) => void,
    clientId?: string | null,
  ): Promise<Unsubscribe> {
    const db = getFirestoreDb()
    const { clientId: resolvedClientId } = await resolveTicketContext(db, ticketId, clientId)

    const messagesQuery = query(
      getMessagesCollection(db, resolvedClientId, ticketId),
      orderBy('createdAt', 'asc'),
    )

    return onSnapshot(
      messagesQuery,
      snapshot => {
        onData(mapMessagesSnapshot(ticketId, snapshot, queryParams))
      },
      error => onError?.(error),
    )
  },
}
