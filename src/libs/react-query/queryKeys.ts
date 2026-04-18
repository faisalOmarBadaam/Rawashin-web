import { useAuthStore } from '@/contexts/auth/auth.store'
import { toStableQueryKeyPart } from '@/shared/api/listQuery'

const getTenantId = (): string => {
  const session = useAuthStore.getState().session
  const tenantId = session?.companyCode ?? session?.userId

  return tenantId ? String(tenantId) : 'public'
}

export const withTenantScope = <TKey extends readonly unknown[]>(key: TKey) => {
  if (key.length === 0) {
    return ['tenant', getTenantId()] as const
  }

  const [root, ...rest] = key

  return [root, 'tenant', getTenantId(), ...rest] as const
}

export const buildEntityQueryKeys = <TRoot extends string>(root: TRoot) => {
  const all = [root] as const

  return {
    /** non-scoped root for compatibility checks/tools */
    root: all,
    /** tenant-scoped key root used by React Query */
    all: withTenantScope(all),
    allScoped: () => withTenantScope(all),
    list: (queryPart?: Record<string, unknown> | string) =>
      withTenantScope(
        queryPart === undefined ? ([...all] as const) : ([...all, queryPart] as const),
      ),
    details: (id: string) => withTenantScope([...all, id] as const),
    /** Compatibility alias */
    detail: (id: string) => withTenantScope([...all, id] as const),
  }
}

export const toEntityListKeyPart = (query: Record<string, unknown>) => toStableQueryKeyPart(query)

export const queryKeyRegistry = {
  clients: {
    keys: buildEntityQueryKeys('clients'),
  },
  transactions: {
    keys: buildEntityQueryKeys('transactions'),
  },
  settlements: {
    keys: buildEntityQueryKeys('settlements'),
  },
  supportTickets: {
    keys: buildEntityQueryKeys('support-tickets'),
  },
  auditLogs: {
    keys: buildEntityQueryKeys('audit-logs'),
  },
} as const

/**
 * Enterprise typed query-key registry (backward compatible with existing builders).
 */
export const QueryKeys = {
  clients: {
    all: withTenantScope(['clients'] as const),
    list: (query?: Record<string, unknown>) =>
      withTenantScope(['clients', 'list', toEntityListKeyPart(query ?? {})] as const),
    detail: (id: string) => withTenantScope(['clients', 'detail', id] as const),
    lookup: (type?: string) => withTenantScope(['clients', 'lookup', type ?? 'all'] as const),
    children: (clientId: string) => withTenantScope(['clients', 'children', clientId] as const),
    settlements: (clientId: string, query?: Record<string, unknown>) =>
      withTenantScope([
        'clients',
        clientId,
        'settlements',
        toEntityListKeyPart(query ?? {}),
      ] as const),
    transactions: (clientId: string, query?: Record<string, unknown>) =>
      withTenantScope([
        'clients',
        clientId,
        'transactions',
        toEntityListKeyPart(query ?? {}),
      ] as const),
  },
  transactions: {
    all: withTenantScope(['transactions'] as const),
    list: (query?: Record<string, unknown>) =>
      withTenantScope(['transactions', 'list', toEntityListKeyPart(query ?? {})] as const),
    detail: (id: string) => withTenantScope(['transactions', 'detail', id] as const),
    statsCount: (clientType?: string) =>
      withTenantScope(['transactions', 'stats', 'count', clientType ?? 'all'] as const),
    totalSum: (clientType?: string) =>
      withTenantScope(['transactions', 'stats', 'sum', clientType ?? 'all'] as const),
    balance: (clientId: string) => withTenantScope(['transactions', 'balance', clientId] as const),
    clientStats: (clientId: string, range?: Record<string, unknown>) =>
      withTenantScope([
        'transactions',
        'client-stats',
        clientId,
        toEntityListKeyPart(range ?? {}),
      ] as const),
  },
  settlements: {
    all: withTenantScope(['settlements'] as const),
    list: (query?: Record<string, unknown>) =>
      withTenantScope(['settlements', 'list', toEntityListKeyPart(query ?? {})] as const),
    detail: (id: string) => withTenantScope(['settlements', 'detail', id] as const),
    byClient: (clientId: string, query?: Record<string, unknown>) =>
      withTenantScope([
        'settlements',
        'client',
        clientId,
        toEntityListKeyPart(query ?? {}),
      ] as const),
    detailsByReference: (referenceId: string) =>
      withTenantScope(['settlements', 'reference', referenceId] as const),
  },
  supportTickets: {
    all: withTenantScope(['supportTickets'] as const),
    list: (query?: Record<string, unknown>) =>
      withTenantScope(['supportTickets', 'list', toEntityListKeyPart(query ?? {})] as const),
    detail: (id: string) => withTenantScope(['supportTickets', 'detail', id] as const),
    byClient: (clientId: string, query?: Record<string, unknown>) =>
      withTenantScope([
        'supportTickets',
        'client',
        clientId,
        toEntityListKeyPart(query ?? {}),
      ] as const),
    messages: (id: string, query?: Record<string, unknown>) =>
      withTenantScope([
        'supportTickets',
        'messages',
        id,
        toEntityListKeyPart(query ?? {}),
      ] as const),
  },
  attachments: {
    all: withTenantScope(['attachments'] as const),
    byClient: (clientId: string, query?: Record<string, unknown>) =>
      withTenantScope([
        'attachments',
        'client',
        clientId,
        toEntityListKeyPart(query ?? {}),
      ] as const),
  },
  auditLogs: {
    all: withTenantScope(['auditLogs'] as const),
    list: (query?: Record<string, unknown>) =>
      withTenantScope(['auditLogs', 'list', toEntityListKeyPart(query ?? {})] as const),
  },
  roles: {
    all: withTenantScope(['roles'] as const),
    byUser: (id: string) => withTenantScope(['roles', 'user', id] as const),
    byClient: (id: string) => withTenantScope(['roles', 'client', id] as const),
  },
  commissions: {
    all: withTenantScope(['commissions'] as const),
    byClient: (id: string) => withTenantScope(['commissions', 'client', id] as const),
  },
  merchant: {
    all: withTenantScope(['merchant'] as const),
    subMerchants: (merchantId: string, query?: Record<string, unknown>) =>
      withTenantScope([
        'merchant',
        merchantId,
        'subMerchants',
        toEntityListKeyPart(query ?? {}),
      ] as const),
    settlements: (merchantId: string) =>
      withTenantScope(['merchant', merchantId, 'settlements'] as const),
  },
  notifications: {
    all: withTenantScope(['notifications'] as const),
  },
} as const
