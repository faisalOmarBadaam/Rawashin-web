import type { RegisterRequestDto } from '@/types/api/auth'
import type { ClientDto, ClientType, LookupDto, UpdateClientRequestDto } from '@/types/api/clients'

import type { RegisterFormValues } from './register.schema'

export const mapRegisterFormToDto = (
  form: RegisterFormValues,
  clientType: ClientType,
): RegisterRequestDto => ({
  email: form.email || null,
  phoneNumber: form.phoneNumber || '',
  password: form.password || null,
  firstName: form.firstName || null,
  secondName: form.secondName || null,
  thirdName: form.thirdName || null,
  lastName: form.lastName || null,
  nationalId: form.nationalId || '',
  organizationName: form.organizationName || null,
  nationalIdType: form.nationalIdType ?? null,
  address: form.address || null,
  city: form.city || null,
  profilePictureUrl: form.profilePictureUrl || null,
  parentClientId: form.parentClientId ? String(form.parentClientId.id) : null,
  clientType,
})

export const mapRegisterFormToUpdateDto = (
  data: RegisterFormValues,
  clientType: ClientType,
): UpdateClientRequestDto => ({
  phoneNumber: data.phoneNumber || null,
  firstName: data.firstName || null,
  secondName: data.secondName || null,
  thirdName: data.thirdName || null,
  lastName: data.lastName || null,
  email: data.email || null,
  nationalId: data.nationalId || null,
  organizationName: data.organizationName || null,
  nationalIdType: data.nationalIdType ?? null,
  address: data.address || null,
  city: data.city || null,
  profilePictureUrl: data.profilePictureUrl || null,
  parentClientId: data.parentClientId ? String(data.parentClientId.id) : null,
  clientType,
})

export const mapClientToRegisterFormValues = (
  client: ClientDto,
  parentClient: LookupDto | null,
): RegisterFormValues => ({
  phoneNumber: client.phoneNumber ?? '',
  firstName: client.firstName ?? '',
  secondName: client.secondName ?? '',
  thirdName: client.thirdName ?? '',
  lastName: client.lastName ?? '',
  email: client.email ?? '',
  nationalId: client.nationalId ?? '',
  organizationName: client.organizationName ?? '',
  nationalIdType: (client.nationalIdType as 0 | 1 | 2) ?? 0,
  address: client.address ?? '',
  city: client.city ?? '',
  profilePictureUrl: client.profilePictureUrl ?? null,
  parentClientId: parentClient,
  password: '',
})
