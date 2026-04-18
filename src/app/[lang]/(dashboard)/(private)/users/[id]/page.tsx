import { ClientType } from '@/types/api/clients'
import ViewEditUsersWrapper from './ViewEditUsersWrapper'

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
  admin: ClientType.Admin,
  charger: ClientType.Charger,
  profit: ClientType.ProfitAccount,
  employee: ClientType.Employee,
} as const

export default async function ViewEdit({ params, searchParams }: Props) {
  const { type, mode } = await searchParams
  const { id } = await params

  const typeParam = (type ?? 'admin') as keyof typeof CLIENT_TYPE_MAP

  const clientType = CLIENT_TYPE_MAP[typeParam] ?? ClientType.Admin

  const pageMode: 'view' | 'edit' = mode === 'edit' ? 'edit' : 'view'

  return <ViewEditUsersWrapper id={id} clientType={clientType} mode={pageMode} />
}
