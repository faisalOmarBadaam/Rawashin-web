import { createEntityModule } from '@/core/entity/createEntityModule'
import { TransactionsApi } from '@/libs/api/modules/transactions.api'
import { QueryKeys } from '@/libs/react-query/queryKeys'
import { normalizeListQuery } from '@/shared/api/listQuery'
import { buildTransactionColumns } from '@/shared/datagrid/columns/transactions.columns'
import type { TransactionsQueryParams } from '@/types/api/transaction'

export const transactionsModule = createEntityModule({
  name: 'transactions',
  entity: 'transactions',
  endpoints: {
    list: TransactionsApi.getAll,
    details: TransactionsApi.getById,
    create: TransactionsApi.create,
    /** backend contract has no update endpoint for transactions; fail explicitly if invoked */
    update: async () => {
      throw new Error('Transaction update is not supported by backend contract')
    },
    remove: TransactionsApi.delete,
  },
  queryKeys: {
    all: QueryKeys.transactions.all,
    list: (query?: TransactionsQueryParams) =>
      QueryKeys.transactions.list(
        normalizeListQuery('transactions', query) as Record<string, unknown>,
      ),
    details: QueryKeys.transactions.detail,
    detail: QueryKeys.transactions.detail,
  },
  permissions: {
    view: 'read',
    create: 'create',
    delete: 'delete',
  },
  columns: {
    list: buildTransactionColumns,
  },
  filters: {
    key: 'transactions.filters',
    fields: ['Search', 'FromDate', 'ToDate', 'TransactionType'],
  },
  defaults: {
    query: {
      PageNumber: 1,
      PageSize: 10,
      SortBy: 'createdAt',
      SortDir: 'desc',
    },
  },
  invalidation: {
    create: [['transactions'], ['clients']],
    update: [['transactions']],
    delete: [['transactions'], ['clients']],
  },
  routes: {
    list: '/transactions',
    detail: id => `/transactions/${id}`,
  },
})
