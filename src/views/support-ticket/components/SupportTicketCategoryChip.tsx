'use client'

import Chip from '@mui/material/Chip'

import { SupportTicketCategory } from '@/types/api/supportTickets'

export const getSupportTicketCategoryLabel = (category?: string | number | null) => {
  if (category === null || category === undefined) return 'غير محدد'

  if (typeof category === 'number') {
    switch (category) {
      case SupportTicketCategory.Issue:
        return 'مشكلة'
      case SupportTicketCategory.Suggestion:
        return 'اقتراح'
      case SupportTicketCategory.Complaint:
        return 'شكوى'
      case SupportTicketCategory.Other:
        return 'أخرى'
      default:
        return 'غير محدد'
    }
  }

  const normalized = category.toString().trim().toLowerCase()

  switch (normalized) {
    case 'issue':
      return 'مشكلة'
    case 'suggestion':
      return 'اقتراح'
    case 'complaint':
      return 'شكوى'
    case 'other':
      return 'أخرى'
    default:
      return 'غير محدد'
  }
}

type Props = {
  category?: string | number | null
}

export default function SupportTicketCategoryChip({ category }: Props) {
  return <Chip label={getSupportTicketCategoryLabel(category)} size='small' variant='outlined' />
}
