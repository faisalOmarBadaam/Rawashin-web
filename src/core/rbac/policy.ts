import { AppRole } from '@/configs/roles'

export type PermissionKey = 'read' | 'create' | 'update' | 'delete'

export type ResourceKey =
  | 'dashboard'
  | 'clients'
  | 'employees'
  | 'settlements'
  | 'transactions'
  | 'users'

export type RoleName = AppRole | string

type ResourcePermissions = Partial<Record<ResourceKey, PermissionKey[]>>

export const RBAC_POLICY: Record<RoleName, ResourcePermissions> = {
  [AppRole.Admin]: {
    dashboard: ['read', 'create', 'update', 'delete'],
    clients: ['read', 'create', 'update', 'delete'],
    employees: ['read', 'create', 'update', 'delete'],
    settlements: ['read', 'create', 'update', 'delete'],
    transactions: ['read', 'create', 'update', 'delete'],
    users: ['read', 'create', 'update', 'delete'],
  },
  [AppRole.Employee]: {
    dashboard: ['read'],
    clients: ['read', 'create', 'update'],
    employees: ['read'],
    settlements: ['read'],
    transactions: ['read', 'create'],
    users: ['read'],
  },
  [AppRole.Charger]: {
    dashboard: ['read'],
    transactions: ['read', 'create'],
  },
  [AppRole.Profit]: {
    dashboard: ['read'],
    settlements: ['read'],
    transactions: ['read'],
  },
  [AppRole.ProfitAccount]: {
    dashboard: ['read'],
    settlements: ['read'],
  },
  [AppRole.Customer]: {},
  [AppRole.Merchant]: {
    dashboard: ['read'],
    transactions: ['read', 'create'],
  },
  [AppRole.Partner]: {},
}

export const BLOCKED_DASHBOARD_ROLES: AppRole[] = [AppRole.Customer, AppRole.Partner]

export const CHARGER_ALLOWED_PRIVATE_PATHS = ['/home', '/transactions', '/charging', '/profile']
