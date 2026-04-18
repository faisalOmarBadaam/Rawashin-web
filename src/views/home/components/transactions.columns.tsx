import { buildTransactionColumns } from '@/shared/datagrid/columns/transactions.columns'

export const getTransactionColumns = (clientsMap: Record<string, string | null>) =>
  buildTransactionColumns(clientsMap, { includeMerchantColumn: false })
