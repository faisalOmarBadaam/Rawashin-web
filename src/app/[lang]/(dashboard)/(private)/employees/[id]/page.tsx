import { ClientType } from '@/types/api/clients'
import ViewEditClientWrapper from './ViewEditClientWrapper'

type Props = {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{
    type?: string
    mode?: 'view' | 'edit'
  }>
}

const CLIENT_TYPE_MAP = {
  client: ClientType.Client,
  merchant: ClientType.Merchant,
  partner: ClientType.Partner
} as const

const TITLES = {
  view: {
    [ClientType.Client]: 'عرض بيانات المستفيد',
    [ClientType.Merchant]: 'عرض بيانات نقطة البيع',
    [ClientType.Partner]: 'عرض بيانات الشريك'
  },
  edit: {
    [ClientType.Client]: 'تعديل بيانات المستفيد',
    [ClientType.Merchant]: 'تعديل بيانات نقطة البيع',
    [ClientType.Partner]: 'تعديل بيانات الشريك'
  }
}

export default async function ViewEdit({ params, searchParams }: Props) {
  const { type, mode } = await searchParams
  const { id } = await params

  const typeParam = (type ?? 'client') as keyof typeof CLIENT_TYPE_MAP
  const clientType = CLIENT_TYPE_MAP[typeParam]

  const pageMode = mode === 'edit' ? 'edit' : 'view'
  const title = TITLES[pageMode][clientType]

  return (
    <ViewEditClientWrapper
      id={id}
      clientType={clientType}
      mode={pageMode}
      title={title}
    />
  )
}
