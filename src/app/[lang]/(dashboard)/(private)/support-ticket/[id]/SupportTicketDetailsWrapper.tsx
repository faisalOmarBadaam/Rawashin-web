'use client'

import { Box } from '@mui/material'

import PageContainer from '@/components/layout/shared/PageContainer'
import SupportTicketDetailsView from '@views/support-ticket/SupportTicketDetailsView'

type Props = {
  id: string
  clientId?: string
}

export default function SupportTicketDetailsWrapper({ id, clientId }: Props) {
  return (
    <PageContainer
      title="تفاصيل التذكرة"
      breadcrumbs={[{ label: 'الدعم الفني', href: '/support-ticket' }, { label: 'تفاصيل التذكرة' }]}
    >
      <Box sx={{ width: '100%', marginTop: '10px' }}>
        <SupportTicketDetailsView ticketId={id} clientId={clientId} />
      </Box>
    </PageContainer>
  )
}
