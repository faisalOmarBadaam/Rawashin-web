import { ClientType } from '@/types/api/clients'

type ClientsTypeKey = 'client' | 'merchant' | 'partner'
type UsersTypeKey = 'admin' | 'profit' | 'charger' | 'employee'

const CLIENTS_TYPE_KEY_MAP: Record<ClientType, ClientsTypeKey> = {
  [ClientType.Client]: 'client',
  [ClientType.Merchant]: 'merchant',
  [ClientType.Partner]: 'partner',
  [ClientType.Admin]: 'client',
  [ClientType.ProfitAccount]: 'client',
  [ClientType.Charger]: 'client',
  [ClientType.Employee]: 'client',
}

const USERS_TYPE_KEY_MAP: Record<ClientType, UsersTypeKey> = {
  [ClientType.Client]: 'admin',
  [ClientType.Merchant]: 'admin',
  [ClientType.Partner]: 'admin',
  [ClientType.Admin]: 'admin',
  [ClientType.ProfitAccount]: 'profit',
  [ClientType.Charger]: 'charger',
  [ClientType.Employee]: 'employee',
}

export const getClientTypeRouteKey = (
  entity: 'clients' | 'users',
  clientType?: ClientType,
): string => {
  if (clientType === undefined || clientType === null) {
    return entity === 'users' ? 'admin' : 'client'
  }

  if (entity === 'users') {
    return USERS_TYPE_KEY_MAP[clientType] ?? 'admin'
  }

  return CLIENTS_TYPE_KEY_MAP[clientType] ?? 'client'
}

export const isActionAllowedByClientTypeMatrix = (
  action: string,
  clientType?: ClientType,
): boolean => {
  if (clientType === undefined || clientType === null) return true

  if (action === 'assign' || action === 'charge') {
    return clientType === ClientType.Client
  }

  if (action === 'print') {
    return clientType === ClientType.Client
  }

  if (action === 'commission') {
    return clientType === ClientType.Merchant
  }

  if (action === 'chargeCharger') {
    return clientType === ClientType.Charger || clientType === ClientType.Employee
  }

  if (action === 'deposit') {
    return clientType === ClientType.Admin
  }

  if (action === 'debt') {
    return clientType === ClientType.Client
  }

  return true
}
