import type { ChipProps } from '@mui/material/Chip'

import { AccountStatus, type AccountStatus as AccountStatusValue } from '../types'

export type AccountStatusInfo = {
  label: string
  color: ChipProps['color']
}

export function getAccountStatusInfo(
  status: AccountStatusValue | number | null | undefined,
): AccountStatusInfo {
  switch (status) {
    case AccountStatus.Inactive:
      return {
        label: 'غير نشط',
        color: 'default',
      }

    case AccountStatus.Active:
      return {
        label: 'نشط',
        color: 'success',
      }

    case AccountStatus.Pending:
      return {
        label: 'قيد الانتظار',
        color: 'warning',
      }

    default:
      return {
        label: status != null ? String(status) : '—',
        color: 'default',
      }
  }
}