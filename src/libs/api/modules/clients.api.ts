import { normalizeListQuery } from '@/shared/api/listQuery'
import { endpoints } from '../endpoints'
import { api } from '../service'

import type {
  ClientContactDto,
  ClientDto,
  ClientPagedResult,
  ClientQueryParams,
  ClientType,
  CreateClientRequestDto,
  CreditAccountDto,
  SubMerchantRequestDto,
  UpdateClientRequestDto,
  UpdatePassCodeCommand,
  UpdateSubMerchantRequestDto,
} from '@/types/api/clients'
import type { CommissionsDto, CreateCommissionDto } from '@/types/api/finance'
import type {
  ClientTransactionsPagedResult,
  TransactionsQueryParams,
} from '@/types/api/transaction'

type AssignCardRequestDto = {
  customCardNumber: string | null
}

export const ClientsApi = {
  getAll(params?: ClientQueryParams) {
    return api.get<ClientPagedResult>(
      endpoints.clients.base,
      normalizeListQuery('clients', params) as Record<string, any>,
    )
  },

  getById(id: string) {
    return api.get<ClientDto>(endpoints.clients.byId(id))
  },

  getContact(id: string) {
    return api.get<ClientContactDto>(endpoints.clients.contact(id))
  },

  create(data: CreateClientRequestDto) {
    return api.post<ClientDto, CreateClientRequestDto>(endpoints.clients.base, data)
  },

  update(id: string, data: UpdateClientRequestDto) {
    return api.put<ClientDto, UpdateClientRequestDto>(endpoints.clients.byId(id), data)
  },

  delete(id: string) {
    return api.delete<void>(endpoints.clients.byId(id))
  },

  changeStatus(clientId: string) {
    return api.patch<void, undefined>(endpoints.clients.changeStatus(clientId), undefined)
  },
  chanceReceiveCard(clientId: string) {
    return api.patch<void, undefined>(endpoints.clients.chanceReceiveCard(clientId), undefined)
  },

  lookup(clientType?: ClientType) {
    return api.get<{ id: string; name: string }[]>(
      endpoints.clients.lookup,
      clientType ? { type: clientType } : undefined,
    )
  },

  lookupChildren(clientId: string) {
    return api.get<{ id: string; name: string }[]>(endpoints.clients.lookupChildren(clientId))
  },

  clientLookup(clientType?: ClientType) {
    return this.lookup(clientType)
  },

  getTransactions(clientId: string, params?: TransactionsQueryParams) {
    return api.get<ClientTransactionsPagedResult>(
      endpoints.clients.transactions(clientId),
      normalizeListQuery('clientTransactions', params) as Record<string, any>,
    )
  },

  getByCreditCard(cardNumber: string) {
    return api.get<ClientDto>(endpoints.clients.byCreditCard(cardNumber))
  },

  updatePassCode(clientId: string, payload: UpdatePassCodeCommand) {
    return api.patch<void, UpdatePassCodeCommand>(
      endpoints.clients.updatePassCode(clientId),
      payload,
    )
  },

  getStatisticsCount(clientType?: ClientType) {
    return api.request<number>(
      'GET',
      endpoints.clients.statisticsCount,
      undefined,
      clientType !== undefined ? { clientType } : undefined,
    )
  },

  createCreditAccount(clientId: string, payload: CreditAccountDto) {
    return api.post<CreditAccountDto, CreditAccountDto>(
      endpoints.clients.creditAccounts(clientId),
      payload,
    )
  },

  createCommission(clientId: string, payload: CreateCommissionDto) {
    return api.post<CommissionsDto, CreateCommissionDto>(
      endpoints.clients.commissions(clientId),
      payload,
    )
  },
  AssignCard(clientId: string, cardNumber: string | null) {
    return api.patch<void, AssignCardRequestDto>(endpoints.clients.AssignNewCard(clientId), {
      customCardNumber: cardNumber,
    })
  },

  createSubMerchant(merchantId: string, payload: SubMerchantRequestDto) {
    return api.post<ClientDto, SubMerchantRequestDto>(
      endpoints.merchant.subMerchants(merchantId),
      payload,
    )
  },

  updateSubMerchant(
    merchantId: string,
    subMerchantId: string,
    payload: UpdateSubMerchantRequestDto,
  ) {
    return api.put<ClientDto, UpdateSubMerchantRequestDto>(
      endpoints.merchant.subMerchantById(merchantId, subMerchantId),
      payload,
    )
  },

  deleteSubMerchant(merchantId: string, subMerchantId: string) {
    return api.delete<void>(endpoints.merchant.subMerchantById(merchantId, subMerchantId))
  },
}
