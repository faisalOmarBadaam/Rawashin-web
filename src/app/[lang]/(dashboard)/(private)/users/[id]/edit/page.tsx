import { ClientType } from '@/types/api/clients'
import ViewEditUsersWrapper from '../ViewEditUsersWrapper'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ type?: string }>
}

const CLIENT_TYPE_MAP = {
  admin: ClientType.Admin,
  charger: ClientType.Charger,
  profit: ClientType.ProfitAccount,
  employee: ClientType.Employee,
} as const

export default async function EditUser({ params, searchParams }: Props) {
  const { type } = await searchParams
  const { id } = await params

  const typeParam = (type ?? 'admin') as keyof typeof CLIENT_TYPE_MAP
  const clientType = CLIENT_TYPE_MAP[typeParam] ?? ClientType.Admin

  return <ViewEditUsersWrapper id={id} clientType={clientType} mode="edit" />
}
