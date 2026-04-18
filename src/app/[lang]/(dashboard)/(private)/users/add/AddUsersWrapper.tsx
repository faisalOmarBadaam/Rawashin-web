'use client'

import ClientAddPage from '@/domains/clients/pages/ClientAddPage'
import type { ClientType } from '@/types/api/clients'

type Props = {
  clientType: ClientType
  title: string
}

export default function AddUsersWrapper({ clientType, title }: Props) {
  return <ClientAddPage variant="users" clientType={clientType} title={title} />
}
