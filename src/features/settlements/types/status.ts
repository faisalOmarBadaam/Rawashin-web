import type { ChipProps } from '@mui/material/Chip'

export const SettlementStatus = {
  New: 0,
  InProcess: 1,
  Completed: 2,
  ClosedWithoutCompletion: 3,
} as const

export type SettlementStatus =
  (typeof SettlementStatus)[keyof typeof SettlementStatus]

export const settlementStatusOptions = [
  { label: 'جديد', value: String(SettlementStatus.New) },
  { label: 'قيد المعالجة', value: String(SettlementStatus.InProcess) },
  { label: 'مكتمل', value: String(SettlementStatus.Completed) },
  { label: 'مغلق بدون إكمال', value: String(SettlementStatus.ClosedWithoutCompletion) },
] as const

export function normalizeSettlementStatus(
  status?: string | number | null,
): SettlementStatus | null {
  const numericStatus = Number(status)

  if (numericStatus === SettlementStatus.New) return SettlementStatus.New
  if (numericStatus === SettlementStatus.InProcess) return SettlementStatus.InProcess
  if (numericStatus === SettlementStatus.Completed) return SettlementStatus.Completed
  if (numericStatus === SettlementStatus.ClosedWithoutCompletion) {
    return SettlementStatus.ClosedWithoutCompletion
  }

  switch (String(status ?? '').toLowerCase()) {
    case 'new':
      return SettlementStatus.New
    case 'inprocess':
    case 'in_process':
    case 'processing':
      return SettlementStatus.InProcess
    case 'completed':
      return SettlementStatus.Completed
    case 'closedwithoutcompletion':
    case 'closed_without_completion':
    case 'failed':
      return SettlementStatus.ClosedWithoutCompletion
    default:
      return null
  }
}

export function getSettlementStatusMeta(status?: string | number | null): {
  label: string
  color: ChipProps['color']
} {
  const normalizedStatus = normalizeSettlementStatus(status)

  switch (normalizedStatus) {
    case SettlementStatus.New:
      return { label: 'جديد', color: 'info' }
    case SettlementStatus.InProcess:
      return { label: 'قيد المعالجة', color: 'warning' }
    case SettlementStatus.Completed:
      return { label: 'مكتمل', color: 'success' }
    case SettlementStatus.ClosedWithoutCompletion:
      return { label: 'مغلق بدون إكمال', color: 'error' }
    default:
      return { label: status != null ? String(status) : '—', color: 'default' }
  }
}