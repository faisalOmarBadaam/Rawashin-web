import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'

import type { PaginatedResponse } from '@/shared/types/BaseResponse'
import type { AddClientRequest, BeneficiaryListParams, ClientTransactionsParams } from '../types/params'
import type { ClientType } from '@/shared/types/ClientType'
import type {
  ClientListResponse,
  ClientLookupResponse,
  ClientTransactionResponse,
  MerchantSubResponse,
} from '../types/responses'
import { createClient, getClientCreditAccountDebtAmount, getClientCreditAccountTotalAmount, getClientDetails, getClientTransactions, getClients, getClientsLookup, getMerchantSubs, deleteMerchantSub, settleMerchantSub, updateClient, deleteClient, UpdateClientAccountStatus, UpdateClientReceiptStatus, ResetClientPassword, AssignClientCard, getClientAttachments, getAttachmentTemporaryUrl, uploadClientAttachment, deleteClientAttachment } from '../api'
import type { AccountStatus, ClientAttachment } from '../types'

export function useClients(params?: BeneficiaryListParams) {
  return useQuery<PaginatedResponse<ClientListResponse>, Error>({
    queryKey: ['clients', params],
    queryFn: () => getClients(params),
    placeholderData: keepPreviousData


  })
}

export function useClient(id?: string) {
  return useQuery<ClientListResponse, Error>({
    queryKey: ['client', id],
    queryFn: () => getClientDetails(id!),
    enabled: Boolean(id),
  })
}

export function useMerchantSubs(id?: string) {
  return useQuery<MerchantSubResponse[], Error>({
    queryKey: ['merchantSubs', id],
    queryFn: () => getMerchantSubs(id!),
    enabled: Boolean(id),
  })
}

export function useClientCreditAccountTotalAmount(clientId?: string) {
  return useQuery<number, Error>({
    queryKey: ['clientCreditAccountTotalAmount', clientId],
    queryFn: () => getClientCreditAccountTotalAmount(clientId!),
    enabled: Boolean(clientId),
  })
}

export function useClientCreditAccountDebtAmount(clientId?: string) {
  return useQuery<number, Error>({
    queryKey: ['clientCreditAccountDebtAmount', clientId],
    queryFn: () => getClientCreditAccountDebtAmount(clientId!),
    enabled: Boolean(clientId),
  })
}

export function useClientTransactions(
  clientId?: string,
  params?: ClientTransactionsParams
) {
  return useQuery<PaginatedResponse<ClientTransactionResponse>, Error>({
    queryKey: ['clientTransactions', clientId, params],
    queryFn: () => getClientTransactions(clientId!, params!),
    enabled: Boolean(clientId),
    placeholderData: keepPreviousData,
  })
}


export function useDeleteMerchantSub() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { merchantId: string; subMerchantId: string }>({
    mutationFn: async ({ merchantId, subMerchantId }) => {
      await deleteMerchantSub(merchantId, subMerchantId)
    },

    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['merchantSubs', variables.merchantId],
      })
    },
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, Partial<AddClientRequest>>({
    mutationFn: (payload) => createClient(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] })
    }
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { id: string; payload: Partial<AddClientRequest> }>({
    mutationFn: async ({ id, payload }) => await updateClient(id, payload),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['client', variables.id] })
    }
  })
}

export function useClientLookup(type: ClientType) {
  return useQuery<ClientLookupResponse[], Error>({
    queryKey: ['clients', 'lookup', type],
    queryFn: () => getClientsLookup(type),
    enabled: Boolean(type),
  })
}
export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { id: string }>({
    mutationFn: async ({ id }) => {
      await deleteClient(id)
    },

    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
        queryClient.removeQueries({ queryKey: ['client', variables.id] }),
      ])
    },
  })
}
export function useSettleMerchantSub() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { merchantId: string; subMerchantId: string }>({
    mutationFn: async ({ merchantId, subMerchantId }) => {
      await settleMerchantSub(merchantId, subMerchantId)
    },

    onSuccess: async (_data, variables) => {

      await queryClient.invalidateQueries({
        queryKey: ['merchantSubs', variables.merchantId],
      })
    },
  })
}

export function useUpdateClientAccountStatus() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    { id: string; accountStatus: AccountStatus }
  >({
    mutationFn: async ({ id, accountStatus }) => {
      await UpdateClientAccountStatus(id, 
       accountStatus
      )
    },

    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['client', variables.id] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
      ])
    },
  })
}

export function useUpdateClientReceiptStatus() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    { id: string; isReceivedCard: boolean }
  >({
    mutationFn: async ({ id, isReceivedCard }) => {
      await UpdateClientReceiptStatus(id, isReceivedCard)
    },

    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['client', variables.id] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
      ])
    },
  })
}

export function useResetClientPassword() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    { id: string; newPassword: string }
  >({
    mutationFn: async ({ id, newPassword }) => {
      await ResetClientPassword(id, { newPassword })
    },

    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['client', variables.id] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
      ])
    },
  })
}

export function useAssignClientCard() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    { id: string; customCardNumber: string }
  >({
    mutationFn: async ({ id, customCardNumber }) => {
      await AssignClientCard(id, { customCardNumber })
    },

    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['client', variables.id] }),
        queryClient.invalidateQueries({ queryKey: ['clients'] }),
      ])
    },
  })
}
export function useGetClientAttachments(id: string) {

  return useQuery<PaginatedResponse<ClientAttachment>, Error>({
    queryKey: ['clientAttachments', id],
    queryFn: async () => {
      const response = await getClientAttachments(id)
      return response
    },
    placeholderData: keepPreviousData
  })
}

export function useAttachmentTemporaryUrl(attachmentId: string) {
  return useQuery<{ url: string }, Error>({
    queryKey: ['attachmentTemporaryUrl', attachmentId],
    queryFn: async () => {
      const response = await getAttachmentTemporaryUrl(attachmentId)
      return response
    },
  })
}

export function useUploadClientAttachment() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, { clientId: string; files: File[] }>({
    mutationFn: async ({ clientId, files }) => {
      await uploadClientAttachment(clientId, files)
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['clientAttachments', variables.clientId],
      })
    },
  })
}

export function useDeleteClientAttachment() {
  const queryClient = useQueryClient()

  return useMutation<
    void,
    Error,
    { clientId: string; attachmentId: string }
  >({
    mutationFn: async ({ attachmentId }) => {
      await deleteClientAttachment(attachmentId)
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['clientAttachments', variables.clientId],
      })
    },
  })
}