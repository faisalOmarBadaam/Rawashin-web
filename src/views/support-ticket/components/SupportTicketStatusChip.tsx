'use client'

import Chip from '@mui/material/Chip'

import { SupportTicketStatus } from '@/types/api/supportTickets'

export type NormalizedSupportTicketStatus = 'Open' | 'InProgress' | 'Complete' | 'Unknown'

const STATUS_LABELS: Record<NormalizedSupportTicketStatus, string> = {
  Open: 'جديدة',
  InProgress: 'قيد المعالجة',
  Complete: 'مغلقة',
  Unknown: 'غير معروف'
}

const STATUS_COLORS: Record<NormalizedSupportTicketStatus, 'default' | 'info' | 'warning' | 'success'> = {
  Open: 'info',
  InProgress: 'warning',
  Complete: 'success',
  Unknown: 'default'
}

export const normalizeSupportTicketStatus = (status?: string | number | null): NormalizedSupportTicketStatus => {
  if (status === null || status === undefined) return 'Unknown'

  if (typeof status === 'number') {
    switch (status) {
      case SupportTicketStatus.Open:
        return 'Open'
      case SupportTicketStatus.InProgress:
        return 'InProgress'
      case SupportTicketStatus.Complete:
        return 'Complete'
      default:
        return 'Unknown'
    }
  }

  const normalized = status.toString().trim().toLowerCase()

  switch (normalized) {
    case 'open':
      return 'Open'
    case 'inprogress':
    case 'in_progress':
    case 'processing':
      return 'InProgress'
    case 'complete':
      return 'Complete'
    default:
      return 'Unknown'
  }
}

type Props = {
  status?: string | number | null
}

export default function SupportTicketStatusChip({ status }: Props) {
  const normalized = normalizeSupportTicketStatus(status)

  return (
    <Chip
      label={STATUS_LABELS[normalized]}
      color={STATUS_COLORS[normalized]}
      size='small'
      variant={normalized === 'Unknown' ? 'outlined' : 'filled'}
    />
  )
}
