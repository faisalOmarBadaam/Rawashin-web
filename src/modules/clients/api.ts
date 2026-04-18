import { ClientsApi } from '@/libs/api/modules/clients.api'
import type {
  ClientDto,
  ClientQueryParams,
  ClientType,
  CreateClientRequestDto,
  LookupDto,
  UpdateClientRequestDto,
} from '@/types/api/clients'

export const clientsModuleApi = {
  list: (params: ClientQueryParams) => ClientsApi.getAll(params),
  getById: (id: string) => ClientsApi.getById(id),
  create: (dto: CreateClientRequestDto) => ClientsApi.create(dto),
  update: (id: string, dto: UpdateClientRequestDto) => ClientsApi.update(id, dto),
  remove: (id: string) => ClientsApi.delete(id),
  lookup: (clientType?: ClientType): Promise<LookupDto[]> => ClientsApi.lookup(clientType),
  lookupChildren: (clientId: string): Promise<LookupDto[]> => ClientsApi.lookupChildren(clientId),
}

export type ClientsModuleListItem = ClientDto
export type ClientsModuleDetails = ClientDto
