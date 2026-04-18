import { ClientType } from '@/types/api/clients'
import AddUsersWrapper from './AddUsersWrapper'

type Props = {
  searchParams: Promise<{
    type?: string
  }>
}

// الأنواع المسموحة فقط
const CLIENT_TYPE_MAP = {
  admin: ClientType.Admin,
  charger: ClientType.Charger,
  profit: ClientType.ProfitAccount,
  employee: ClientType.Employee
} as const

const TITLES: Record<ClientType, string> = {
  [ClientType.Client]: '',
  [ClientType.Merchant]: '',
  [ClientType.Partner]: '',
  [ClientType.Admin]: 'إضافة مدير للنظام',
  [ClientType.Charger]: 'إضافة حساب شحن',
  [ClientType.ProfitAccount]: 'إضافة حساب أرباح',
  [ClientType.Employee]: 'إضافة حساب المدخلين'
}

export default async function Add({ searchParams }: Props) {
  const { type } = await searchParams
  const typeParam = type ?? 'admin'

  // fallback آمن: Admin
  const clientType =
    CLIENT_TYPE_MAP[typeParam as keyof typeof CLIENT_TYPE_MAP] ??
    ClientType.Admin

  const title = TITLES[clientType]

  return <AddUsersWrapper clientType={clientType} title={title} />
}
