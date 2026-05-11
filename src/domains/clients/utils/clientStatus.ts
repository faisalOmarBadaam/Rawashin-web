import { ClientStatus, type ClientDto } from '@/types/api/clients'

export const CLIENT_STATUS_OPTIONS = [
  { value: ClientStatus.Active, label: 'نشط' },
  { value: ClientStatus.InActive, label: 'غير نشط' },
  { value: ClientStatus.Pending, label: 'قيد الانتظار' },
] as const

const isKnownClientStatus = (value: ClientStatus | null | undefined): value is ClientStatus => {
  return (
    value === ClientStatus.Active ||
    value === ClientStatus.InActive ||
    value === ClientStatus.Pending
  )
}

export const getClientStatus = (
  client: Pick<ClientDto, 'status' | 'accountStatus' | 'AccountStatus' | 'isActive'>,
): ClientStatus => {
  if (isKnownClientStatus(client.status)) {
    return client.status
  }

  if (isKnownClientStatus(client.accountStatus)) {
    return client.accountStatus
  }

  if (isKnownClientStatus(client.AccountStatus)) {
    return client.AccountStatus
  }

  return client.isActive ? ClientStatus.Active : ClientStatus.InActive
}

export const getClientStatusLabel = (status: ClientStatus) => {
  const option = CLIENT_STATUS_OPTIONS.find(item => item.value === status)

  return option?.label ?? 'غير معروف'
}

export const getClientStatusChipColor = (status: ClientStatus) => {
  if (status === ClientStatus.Active) return 'success'
  if (status === ClientStatus.Pending) return 'warning'

  return 'error'
}
