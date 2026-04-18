'use client'

import ClientEditPage from '@/domains/clients/pages/ClientEditPage'
import type { ClientType } from '@/types/api/clients'

type Props = {
  id: string
  clientType: ClientType
  mode: 'view' | 'edit'
  title: string
}

export default function ViewEditClientWrapper({ id, clientType, mode, title }: Props) {
  return (
    <ClientEditPage
      variant="clients"
      clientId={id}
      clientType={clientType}
      title={title}
      mode={mode}
    />
  )
}
