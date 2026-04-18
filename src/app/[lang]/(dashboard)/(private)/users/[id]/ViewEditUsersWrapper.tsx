'use client'

import ClientEditPage from '@/domains/clients/pages/ClientEditPage'
import { ClientType } from '@/types/api/clients'

type AllowedClientType =
  | ClientType.Admin
  | ClientType.Charger
  | ClientType.ProfitAccount
  | ClientType.Employee

type Props = {
  id: string
  clientType: ClientType
  mode: 'view' | 'edit'
}

const TITLES: Record<'view' | 'edit', Record<AllowedClientType, string>> = {
  view: {
    [ClientType.Admin]: 'عرض بيانات مدير النظام',
    [ClientType.Charger]: 'عرض بيانات حساب الشحن',
    [ClientType.ProfitAccount]: 'عرض بيانات حساب الأرباح',
    [ClientType.Employee]: 'عرض بيانات حساب المدخلين',
  },
  edit: {
    [ClientType.Admin]: 'تعديل بيانات مدير النظام',
    [ClientType.Charger]: 'تعديل بيانات حساب الشحن',
    [ClientType.ProfitAccount]: 'تعديل بيانات حساب الأرباح',
    [ClientType.Employee]: 'تعديل بيانات حساب المدخلين',
  },
}

export default function ViewEditUsersWrapper({ id, clientType, mode }: Props) {
  const allowedTypes: AllowedClientType[] = [
    ClientType.Admin,
    ClientType.Charger,
    ClientType.ProfitAccount,
    ClientType.Employee,
  ]

  if (!allowedTypes.includes(clientType as AllowedClientType)) {
    throw new Error('Unsupported client type')
  }

  const title = TITLES[mode][clientType as AllowedClientType]

  return (
    <ClientEditPage
      variant="users"
      clientId={id}
      clientType={clientType}
      title={title}
      mode={mode}
    />
  )
}
