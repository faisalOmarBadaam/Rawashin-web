import { ClientType } from '@/types/api/clients'
import ViewEditClientWrapper from '../ViewEditClientWrapper'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ type?: string }>
}

const CLIENT_TYPE_MAP = {
  client: ClientType.Client,
  merchant: ClientType.Merchant,
  partner: ClientType.Partner
} as const

const TITLES = {
  [ClientType.Client]: 'عرض بيانات المستفيد',
  [ClientType.Merchant]: 'عرض بيانات نقطة البيع',
  [ClientType.Partner]: 'عرض بيانات الشريك'
}

export default async function ViewClient({ params, searchParams }: Props) {
  const { type } = await searchParams
  const { id } = await params

  const typeParam = (type ?? 'client') as keyof typeof CLIENT_TYPE_MAP
  const clientType = CLIENT_TYPE_MAP[typeParam]

  return (
    <ViewEditClientWrapper
      id={id}
      clientType={clientType}
      mode="view"
      title={TITLES[clientType]}
    />
  )
}
