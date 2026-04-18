import { ClientType } from '@/types/api/clients'
import AddClientWrapper from './AddClientWrapper'

type Props = {
  searchParams: Promise<{
    type?: string
  }>
}

const CLIENT_TYPE_MAP = {
  client: ClientType.Client,
  merchant: ClientType.Merchant,
  partner: ClientType.Partner
} as const

const TITLES = {
  [ClientType.Client]: 'إضافة مستفيد',
  [ClientType.Merchant]: 'إضافة نقطة بيع',
  [ClientType.Partner]: 'إضافة شريك'
}

export default async function Add({ searchParams }: Props) {
  const { type } = await searchParams
  const typeParam = type ?? 'client'

  const clientType =
    CLIENT_TYPE_MAP[typeParam as keyof typeof CLIENT_TYPE_MAP]

  const title = TITLES[clientType]

  return <AddClientWrapper clientType={clientType} title={title} />
}
