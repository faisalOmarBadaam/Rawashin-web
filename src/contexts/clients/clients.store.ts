import { create } from 'zustand'

import { ClientsApi } from '@/libs/api/modules/clients.api'

import type { ClientStatus, ClientType } from '@/types/api/clients'
import {
  type ClientContactDto,
  type ClientDto,
  type ClientQueryParams,
  type CreateClientRequestDto,
  type CreditAccountDto,
  type LookupDto,
  type SubMerchantRequestDto,
  type UpdateClientRequestDto,
  type UpdateSubMerchantRequestDto,
} from '@/types/api/clients'

import { trackEntityCreated, trackEntityDeleted, trackEntityUpdated } from '@/core/analytics/events'
import { queryClient } from '@/libs/react-query/queryClient'
import { QueryKeys, withTenantScope } from '@/libs/react-query/queryKeys'
import { clientsModule } from '@/modules/clients/clients.module'
import { normalizeListQuery, toStableQueryKeyPart } from '@/shared/api/listQuery'
import type { CommissionsDto, CreateCommissionDto } from '@/types/api/finance'
import type {
  ClientTransactionsPagedResult,
  TransactionsQueryParams,
} from '@/types/api/transaction'

const CLIENTS_KEY = (query: ClientQueryParams) =>
  QueryKeys.clients.list(normalizeListQuery('clients', query) as Record<string, unknown>)

const CLIENT_KEY = (id: string) => QueryKeys.clients.detail(id)
const CLIENT_CONTACT_KEY = (id: string) =>
  withTenantScope(['clients', 'contact', id, toStableQueryKeyPart({})] as const)

type ClientsState = {
  list: ClientDto[]
  totalCount: number
  loading: boolean
  error: string | null

  selectedClient: ClientDto | null
  selectedClientContact: ClientContactDto | null
  clientContactsById: Record<string, ClientContactDto>
  query: ClientQueryParams

  fetchClients: () => Promise<void>
  fetchClientById: (id: string) => Promise<void>
  fetchClientContact: (id: string) => Promise<ClientContactDto | null>
  clearClientContact: () => void

  createClient: (payload: CreateClientRequestDto) => Promise<ClientDto>
  updateClient: (id: string, payload: UpdateClientRequestDto) => Promise<ClientDto>
  deleteClient: (id: string) => Promise<void>

  changeStatus: (clientId: string, status: ClientStatus) => Promise<void>

  chanceReceiveCard: (clientId: string) => Promise<void>

  fetchTransactions: (
    clientId: string,
    params?: TransactionsQueryParams,
  ) => Promise<ClientTransactionsPagedResult>

  createCreditAccount: (clientId: string, payload: CreditAccountDto) => Promise<CreditAccountDto>

  createCommission: (clientId: string, payload: CreateCommissionDto) => Promise<CommissionsDto>

  fetchLookup: (clientType?: ClientType) => Promise<LookupDto[]>
  clientLookup: (clientType?: ClientType) => Promise<LookupDto[]>
  lookupChildren: (clientId: string) => Promise<LookupDto[]>

  fetchStatisticsCount: (clientType?: ClientType) => Promise<number>

  setQuery: (query: Partial<ClientQueryParams>, options?: { resetPage?: boolean }) => void

  assignCard: (clientId: string, cardNumber: string) => Promise<unknown>

  createSubMerchant: (merchantId: string, payload: SubMerchantRequestDto) => Promise<ClientDto>
  updateSubMerchant: (
    merchantId: string,
    subMerchantId: string,
    payload: UpdateSubMerchantRequestDto,
  ) => Promise<ClientDto>
  deleteSubMerchant: (merchantId: string, subMerchantId: string) => Promise<void>
}

export const useClientsStore = create<ClientsState>((set, get) => ({
  list: [],
  totalCount: 0,
  loading: false,
  error: null,

  selectedClient: null,
  selectedClientContact: null,
  clientContactsById: {},

  query: {
    // TODO: legacy adapter - removable after migration verification.
    ...(clientsModule.defaults.query as ClientQueryParams),
  },

  setQuery: (q, options) => {
    set(state => {
      const nextQuery = {
        ...state.query,
        ...q,
      }

      if (options?.resetPage) {
        nextQuery.PageNumber = 1
      }

      return { query: nextQuery }
    })
  },

  clearClientContact: () => {
    set({ selectedClientContact: null })
  },

  fetchClients: async () => {
    set({ loading: true, error: null })

    try {
      const query = get().query
      const normalizedQuery = normalizeListQuery('clients', query) as ClientQueryParams

      const data = await queryClient.fetchQuery({
        queryKey: CLIENTS_KEY(normalizedQuery),
        // TODO: legacy adapter - removable after migration verification.
        queryFn: () => clientsModule.endpoints.list(normalizedQuery),
        staleTime: 0,
      })

      set({
        list: data.items ?? [],
        totalCount: data.totalCount,
        loading: false,
      })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Failed to load clients' })
    }
  },

  fetchClientById: async id => {
    set({ loading: true })

    try {
      const client = await queryClient.fetchQuery({
        queryKey: CLIENT_KEY(id),
        // TODO: legacy adapter - removable after migration verification.
        queryFn: () => clientsModule.endpoints.details(id),
      })

      set({ selectedClient: client, loading: false })
    } catch (e: any) {
      set({ loading: false, error: e?.message ?? 'Failed to load client' })
    }
  },

  fetchClientContact: async id => {
    const cachedContact = get().clientContactsById[id]

    if (cachedContact) {
      set({ selectedClientContact: cachedContact })

      return cachedContact
    }

    try {
      const contact = await queryClient.fetchQuery({
        queryKey: CLIENT_CONTACT_KEY(id),
        queryFn: () => ClientsApi.getContact(id),
        staleTime: 5 * 60 * 1000,
      })

      set(state => ({
        selectedClientContact: contact ?? null,
        clientContactsById: contact
          ? {
              ...state.clientContactsById,
              [id]: contact,
            }
          : state.clientContactsById,
      }))

      return contact ?? null
    } catch (e: any) {
      set({ selectedClientContact: null, error: e?.message ?? 'Failed to load client contact' })

      return null
    }
  },

  createClient: async payload => {
    const client = await ClientsApi.create(payload)

    trackEntityCreated({
      entityType: 'client',
      entityId: client.id,
      module: 'clients',
    })

    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all })

    return client
  },

  updateClient: async (id, payload) => {
    const client = await ClientsApi.update(id, payload)

    trackEntityUpdated({
      entityType: 'client',
      entityId: client.id ?? id,
      module: 'clients',
    })

    queryClient.invalidateQueries({ queryKey: CLIENT_KEY(id) })
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all })
    set({ selectedClient: client })

    return client
  },

  deleteClient: async id => {
    set(state => ({
      list: state.list.filter(c => c.id !== id),
      totalCount: state.totalCount - 1,
    }))

    await ClientsApi.delete(id)

    trackEntityDeleted({
      entityType: 'client',
      entityId: id,
      module: 'clients',
    })

    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all })
    queryClient.invalidateQueries({ queryKey: CLIENT_KEY(id) })
  },

  changeStatus: async (clientId, status) => {
    await ClientsApi.changeStatus(clientId, status)
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all })
    queryClient.invalidateQueries({ queryKey: CLIENT_KEY(clientId) })
  },

  chanceReceiveCard: async (clientId: string) => {
    await ClientsApi.chanceReceiveCard(clientId)
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all })
    queryClient.invalidateQueries({ queryKey: CLIENT_KEY(clientId) })
  },

  fetchTransactions: (clientId, params) => ClientsApi.getTransactions(clientId, params),

  createCreditAccount: (clientId, payload) => ClientsApi.createCreditAccount(clientId, payload),

  createCommission: (clientId, payload) => ClientsApi.createCommission(clientId, payload),

  fetchLookup: clientType => ClientsApi.lookup(clientType),

  clientLookup: clientType => ClientsApi.clientLookup(clientType),

  lookupChildren: clientId => ClientsApi.lookupChildren(clientId),

  fetchStatisticsCount: clientType => ClientsApi.getStatisticsCount(clientType),

  assignCard: async (clientId, cardNumber) => {
    await ClientsApi.AssignCard(clientId, cardNumber)

    set(state => {
      if (!state.selectedClient || state.selectedClient.id !== clientId) {
        return state
      }

      const currentCreditAccount = state.selectedClient.creditAccount

      return {
        selectedClient: {
          ...state.selectedClient,
          creditAccount: currentCreditAccount
            ? {
                ...currentCreditAccount,
                cardNumber,
              }
            : currentCreditAccount,
        },
      }
    })

    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all })
    queryClient.invalidateQueries({ queryKey: CLIENT_KEY(clientId) })
  },

  createSubMerchant: async (merchantId, payload) => {
    const subMerchant = await ClientsApi.createSubMerchant(merchantId, payload)
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all })
    queryClient.invalidateQueries({ queryKey: QueryKeys.merchant.subMerchants(merchantId) })

    return subMerchant
  },

  updateSubMerchant: async (merchantId, subMerchantId, payload) => {
    const subMerchant = await ClientsApi.updateSubMerchant(merchantId, subMerchantId, payload)
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all })
    queryClient.invalidateQueries({ queryKey: QueryKeys.merchant.subMerchants(merchantId) })
    queryClient.invalidateQueries({ queryKey: CLIENT_KEY(subMerchantId) })

    return subMerchant
  },

  deleteSubMerchant: async (merchantId, subMerchantId) => {
    set(state => {
      const exists = state.list.some(client => client.id === subMerchantId)

      return {
        list: state.list.filter(client => client.id !== subMerchantId),
        totalCount: exists ? Math.max(0, state.totalCount - 1) : state.totalCount,
      }
    })

    await ClientsApi.deleteSubMerchant(merchantId, subMerchantId)
    queryClient.invalidateQueries({ queryKey: QueryKeys.clients.all })
    queryClient.invalidateQueries({ queryKey: QueryKeys.merchant.subMerchants(merchantId) })
    queryClient.invalidateQueries({ queryKey: CLIENT_KEY(subMerchantId) })
  },
}))
