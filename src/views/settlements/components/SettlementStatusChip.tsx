'use client'

import Chip from '@mui/material/Chip'

import { SettlementStatus } from '@/types/api/settlements'

export type NormalizedSettlementStatus =
  | 'New'
  | 'InProcess'
  | 'Completed'
  | 'ClosedWithoutCompletion'
  | 'Unknown'

const STATUS_LABELS: Record<NormalizedSettlementStatus, string> = {
  New: 'جديدة',
  InProcess: 'قيد المعالجة',
  Completed: 'مكتملة',
  ClosedWithoutCompletion: 'مغلقة بدون إتمام',
  Unknown: 'غير معروف',
}

const STATUS_COLORS: Record<
  NormalizedSettlementStatus,
  'default' | 'warning' | 'info' | 'success' | 'error'
> = {
  New: 'warning',
  InProcess: 'info',
  Completed: 'success',
  ClosedWithoutCompletion: 'error',
  Unknown: 'default',
}

export const normalizeSettlementStatus = (
  status?: string | number | null,
): NormalizedSettlementStatus => {
  if (status === null || status === undefined) return 'Unknown'

  if (typeof status === 'number') {
    switch (status) {
      case SettlementStatus.New:
        return 'New'
      case SettlementStatus.InProcess:
        return 'InProcess'
      case SettlementStatus.Completed:
        return 'Completed'
      case SettlementStatus.ClosedWithoutCompletion:
        return 'ClosedWithoutCompletion'
      default:
        return 'Unknown'
    }
  }

  const normalized = status.toString().trim().toLowerCase()

  switch (normalized) {
    case 'new':
    case 'pending':
      return 'New'
    case 'inprocess':
    case 'in_process':
    case 'processing':
      return 'InProcess'
    case 'completed':
      return 'Completed'
    case 'closedwithoutcompletion':
    case 'closed_without_completion':
    case 'cancelled':
    case 'canceled':
      return 'ClosedWithoutCompletion'
    default:
      return 'Unknown'
  }
}

export const getSettlementStatusLabel = (status?: string | number | null) =>
  STATUS_LABELS[normalizeSettlementStatus(status)]

type Props = {
  status?: string | number | null
}

export default function SettlementStatusChip({ status }: Props) {
  const normalized = normalizeSettlementStatus(status)

  return (
    <Chip
      label={STATUS_LABELS[normalized]}
      color={STATUS_COLORS[normalized]}
      size="small"
      variant={normalized === 'Unknown' ? 'outlined' : 'filled'}
    />
  )
}
