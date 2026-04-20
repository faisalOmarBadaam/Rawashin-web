import { normalizeListQuery } from '@/shared/api/listQuery'
import { endpoints } from '../endpoints'
import { api } from '../service'

import type { ClientType } from '@/types/api/clients'
import type {
  ChargerChargeCustomerRequestDto,
  ChargerStatisticsDto,
  ClientBalanceDto,
  ClientTransactionsPagedResult,
  DepositDto,
  GetClientsBalancesSumRequestDto,
  RefundTransactionRequestDto,
  TransactionBalanceSummaryDto,
  TransactionChargeDto,
  TransactionDto,
  TransactionRequestDto,
  TransactionResultDto,
  TransactionsQueryParams,
  UploadBatchFileResultDto,
  UploadBatchResultDto,
} from '@/types/api/transaction'
import { apiClient } from '../client'

const extractFileNameFromContentDisposition = (header?: string | null): string | null => {
  if (!header) return null

  const utf8Match = header.match(/filename\*=UTF-8''([^;]+)/i)

  if (utf8Match?.[1]) {
    try {
      return decodeURIComponent(utf8Match[1].trim().replace(/^"|"$/g, ''))
    } catch {
      return utf8Match[1].trim().replace(/^"|"$/g, '')
    }
  }

  const plainMatch = header.match(/filename=([^;]+)/i)
  if (!plainMatch?.[1]) return null

  return plainMatch[1].trim().replace(/^"|"$/g, '')
}

export const TransactionsApi = {
  create(payload: TransactionRequestDto) {
    return api.post<TransactionResultDto, TransactionRequestDto>(
      endpoints.transactions.base,
      payload,
    )
  },

  getAll(params?: TransactionsQueryParams) {
    return api.get<ClientTransactionsPagedResult>(
      endpoints.transactions.base,
      normalizeListQuery('transactions', params),
    )
  },

  getById(id: string) {
    return api.get<TransactionDto>(endpoints.transactions.byId(id))
  },

  delete(id: string) {
    return api.delete<void>(endpoints.transactions.byId(id))
  },

  getClientTransactions(clientId: string, params?: TransactionsQueryParams) {
    return api.get<ClientTransactionsPagedResult>(
      endpoints.clients.transactions(clientId),
      normalizeListQuery('clientTransactions', params),
    )
  },

  getClientTotalAmount(clientId: string) {
    return api.get<number>(endpoints.clients.transactionsTotalAmount(clientId))
  },

  getClientDebtAmount(clientId: string): Promise<number> {
    return apiClient
      .get(endpoints.clients.transactionsDebtAmount(clientId))
      .then(res => res.data as number)
  },

  async getBalance(clientId: string): Promise<ClientBalanceDto> {
    const totalAmount = await api.get<number>(endpoints.clients.transactionsTotalAmount(clientId))

    return {
      clientId,
      currentBalance: Number(totalAmount ?? 0),
      currency: null,
      lastUpdated: null,
    }
  },

  chargeCreditAccount(payload: TransactionChargeDto) {
    return api.post<unknown, TransactionChargeDto>(
      endpoints.transactions.chargeCreditAccount,
      payload,
    )
  },

  debtCreditAccount(payload: TransactionChargeDto) {
    return api.post<unknown, TransactionChargeDto>(
      endpoints.transactions.debtCreditAccount,
      payload,
    )
  },

  getStatisticsCount(clientType?: ClientType) {
    return api.request<number>(
      'GET',
      endpoints.transactions.statisticsCount,
      undefined,
      clientType ? { clientType } : undefined,
    )
  },

  getStatisticsTotalSum(clientType?: ClientType) {
    return api.request<TransactionBalanceSummaryDto>(
      'GET',
      endpoints.transactions.statisticsTotalSum,
      undefined,
      clientType ? { clientType } : undefined,
    )
  },

  uploadBatch(partnerId: string, file: File): Promise<UploadBatchResultDto> {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient
      .post(endpoints.transactions.uploadBatch(partnerId), formData)
      .then(res => res.data as UploadBatchResultDto)
  },

  uploadAccountChargesBatch(file: File): Promise<UploadBatchFileResultDto> {
    const formData = new FormData()
    formData.append('file', file)

    return apiClient
      .post(endpoints.transactions.accountChargesBatch, formData, { responseType: 'blob' })
      .then(res => ({
        fileBlob: res.data as Blob,
        fileName: extractFileNameFromContentDisposition(res.headers['content-disposition']),
        contentType:
          (typeof res.headers['content-type'] === 'string' ? res.headers['content-type'] : null) ??
          null,
      }))
  },

  deposit(payload: DepositDto) {
    return api.post<void, DepositDto>(endpoints.transactions.deposit, payload)
  },

  chargerChargeCustomer(id: string, payload: ChargerChargeCustomerRequestDto) {
    return api.post<void, ChargerChargeCustomerRequestDto>(
      endpoints.transactions.chargerChargeCustomer(id),
      payload,
    )
  },

  refillCharger(params: { chargerId: string; amount: number; adminLiquidityId: string }) {
    return api.request<void>('POST', endpoints.transactions.refillCharger, undefined, params)
  },

  getChargerStatistics(clientId: string, params?: TransactionsQueryParams) {
    return api.get<ChargerStatisticsDto>(endpoints.transactions.chargerStatistics(clientId), params)
  },

  refund(payload: RefundTransactionRequestDto) {
    return api.post<void, RefundTransactionRequestDto>(endpoints.transactions.refund, payload)
  },

  getByReference(clientId: string, referenceId: string) {
    return api.get<TransactionDto[]>(endpoints.transactions.getByReference(clientId, referenceId))
  },

  getBalancesTotal(payload: GetClientsBalancesSumRequestDto) {
    return api.post<number, GetClientsBalancesSumRequestDto>(
      endpoints.transactions.balancesTotal,
      payload,
    )
  },
}
