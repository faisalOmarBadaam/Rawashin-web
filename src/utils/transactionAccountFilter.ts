import { transactionTypes, transactionTypeValues } from '@/types/api/transaction'

import type { TransactionForClientDto, TransactionType } from '@/types/api/transaction'

export const transactionAccountFilters = ['current', 'debt'] as const

export type TransactionAccountFilter = (typeof transactionAccountFilters)[number]

export const transactionAccountFilterLabels: Record<TransactionAccountFilter, string> = {
  current: 'الحساب الجاري',
  debt: 'حساب المديونية',
}

export const getTransactionTypesForAccountFilter = (
  _accountFilter: TransactionAccountFilter,
  options?: { excludeSettlement?: boolean },
): TransactionType[] =>
  transactionTypes.filter(type => {
    if (type === 'Debt') return false
    if (options?.excludeSettlement && type === 'Settlement') return false

    return true
  })

export const normalizeTransactionTypeForAccountFilter = (
  accountFilter: TransactionAccountFilter,
  transactionType?: TransactionType,
): TransactionType | undefined => {
  if (accountFilter === 'debt') {
    return 'Debt'
  }

  return transactionType === 'Debt' ? undefined : transactionType
}

export const filterTransactionsByAccountFilter = (
  rows: TransactionForClientDto[],
  accountFilter: TransactionAccountFilter,
  transactionType?: TransactionType,
) => {
  if (accountFilter === 'debt') {
    return rows.filter(
      row => row.transactionType && transactionTypeValues[row.transactionType] !== 4,
    )
  }

  if (transactionType) {
    return rows
  }

  return rows.filter(
    row => !row.transactionType || transactionTypeValues[row.transactionType] !== 4,
  )
}
