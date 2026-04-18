'use client'

import ClientEditPage from '@/domains/clients/pages/ClientEditPage'
import { ClientType } from '@/types/api/clients'

type Props = {
  id: string
  mode: 'view' | 'edit'
}

const TITLES = {
  view: 'عرض بيانات الحساب الفرعي',
  edit: 'تعديل بيانات الحساب الفرعي',
} as const

export default function ViewEditSubMerchantWrapper({ id, mode }: Props) {
  return (
    <ClientEditPage
      variant="merchants"
      clientId={id}
      clientType={ClientType.Merchant}
      title={TITLES[mode]}
      mode={mode}
      //breadcrumbs={[{ label: 'الحسابات الفرعية', href: '/merchants' }, { label: TITLES[mode] }]}
    />
  )
}
