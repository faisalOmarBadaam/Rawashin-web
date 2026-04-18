'use client'

import type { ClientVariant } from '../variants/clientVariants'
import ClientListPage from './ClientListPage'

type Props = {
  variant: ClientVariant
}

export default function ClientsVariantPage({ variant }: Props) {
  return <ClientListPage variant={variant} />
}
