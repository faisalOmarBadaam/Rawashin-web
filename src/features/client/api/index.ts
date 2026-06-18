import { http } from '@/lib/http'
import type { PaginatedResponse } from '@/shared/types/BaseResponse'
import type { AddClientRequest, BeneficiaryListParams } from '../types/params'
import type { ClientType } from '@/shared/types/ClientType'
import type { ClientListResponse, ClientLookupResponse, MerchantSubResponse } from '../types/responses'

const ClientEndpoints = {
  list: 'clients',
  create: 'auths/register',
  lookup: 'clients/lookup',
  byId: (id: string) => `clients/${id}`,
  merchantSubs: (id: string) => `merchants/${id}/subs`,
  merchantSub: (merchantId: string, subMerchantId: string) => `merchants/${merchantId}/subs/${subMerchantId}`,
  merchantSubSettlement: (merchantId: string, subMerchantId: string) =>
    `merchants/${merchantId}/sub-merchants/${subMerchantId}/settlements`,
  updateClientAccountStatus: (id: string) => `clients/${id}/status`,
  resetClientPassword: `auths/admin-reset-password`,
  assignClientCard:(id:string)=>`customers/${id}/card`
} as const



export async function getClients(
  params?: BeneficiaryListParams
): Promise<PaginatedResponse<ClientListResponse>> {
  const response = await http.get<PaginatedResponse<ClientListResponse>>(
    ClientEndpoints.list,
    { params }
  )

  return response.data
}

  export async function getClientDetails(
    id: string
): Promise<ClientListResponse> {
  const response = await http.get<ClientListResponse>(
    ClientEndpoints.byId(id)
  )

  return response.data
}

export async function getMerchantSubs(
  merchantId: string
): Promise<MerchantSubResponse[]> {
  const response = await http.get<MerchantSubResponse[]>(
    ClientEndpoints.merchantSubs(merchantId)
  )

  return response.data
}

export async function deleteMerchantSub(
  merchantId: string,
  subMerchantId: string
) {
  return await http.delete(
    ClientEndpoints.merchantSub(merchantId, subMerchantId)
  )
}

export async function settleMerchantSub(
  merchantId: string,
  subMerchantId: string
): Promise<void> {
  await http.post(
    ClientEndpoints.merchantSubSettlement(merchantId, subMerchantId)
  )
}

export async function createClient(
  payload: Partial<AddClientRequest>
): Promise<void> {
  await http.post<ClientListResponse>(
    ClientEndpoints.create,
    payload
  )
}

export async function updateClient(
  id: string,
  payload: Partial<AddClientRequest>
): Promise<void> {
  await http.put<ClientListResponse>(
    ClientEndpoints.byId(id),
    payload
  )
}

export async function getClientsLookup(
  type: ClientType
): Promise<ClientLookupResponse[]> {
  const response = await http.get<ClientLookupResponse[]>(
    ClientEndpoints.lookup,
    { params: { type } }
  )

  return response.data
}

export function deleteClient(id: string) {
  return http.delete(ClientEndpoints.byId(id))
}

export function UpdateClientAccountStatus(id: string , payload:number) {
  return http.patch(ClientEndpoints.updateClientAccountStatus(id),  payload)
}

export function ResetClientPassword(id: string , payload:{"newPassword":string}) {
  return http.post(ClientEndpoints.resetClientPassword,  payload,{
      params: {
        UserId: id,
      },})
}

export function AssignClientCard(id: string , payload:{"customCardNumber":string}) {
  return http.put(ClientEndpoints.assignClientCard(id),  payload,)
}