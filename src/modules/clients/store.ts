import { createEntityStore } from '@/core/store/createEntityStore'
import { clientsModuleApi } from '@/modules/clients/api'
import { ClientType, type ClientDto, type ClientQueryParams, type CreateClientRequestDto, type UpdateClientRequestDto } from '@/types/api/clients'

export type ClientsFilters = Omit<ClientQueryParams, 'PageNumber' | 'PageSize'>

export const useClientsEntityStore = createEntityStore<
  ClientDto,
  ClientDto,
  CreateClientRequestDto,
  UpdateClientRequestDto,
  ClientsFilters
>({
  adapter: {
    list: async (filters, pagination) => {
      const response = await clientsModuleApi.list({
        ...filters,
        PageNumber: pagination.page,
        PageSize: pagination.pageSize
      })

      return {
        items: response.items ?? [],
        total: response.totalCount
      }
    },
    getById: async id => clientsModuleApi.getById(String(id)),
    create: async dto => clientsModuleApi.create(dto),
    update: async (id, dto) => clientsModuleApi.update(String(id), dto),
    delete: async id => clientsModuleApi.remove(String(id))
  },
  initialFilters: {
    ClientType: ClientType.Client
  },
  initialPagination: {
    page: 1,
    pageSize: 10
  },
  selectListItemId: item => item.id,
  selectDetailsId: details => details.id,
  toDetailsFromCreateResult: result => result,
  toDetailsFromUpdateResult: result => result
})
