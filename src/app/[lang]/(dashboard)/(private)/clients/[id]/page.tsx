'use client'

import { useEffect, useRef } from 'react'

import { useParams, useRouter, useSearchParams } from 'next/navigation'

import { toast } from 'react-toastify'

import RegisterForm, {
  type RegisterFormRef,
} from '@/domains/clients/components/ClientForm/RegisterForm'

import FormPageContainer from '@/layout/FormPageContainer'

import { useClientsStore } from '@/contexts/clients/clients.store'
import { useRegisterStore } from '@/contexts/clients/register.store'
import {
  mapRegisterFormToDto,
  mapRegisterFormToUpdateDto,
} from '@/domains/clients/utils/register.mapper'
import type { RegisterFormValues } from '@/domains/clients/utils/register.schema'
import { getErrorMessage } from '@/libs/api/getErrorMessage'
import { ClientType } from '@/types/api/clients'

const getDuplicateField = (error: any): 'phoneNumber' | 'email' | null => {
  const source = [
    error?.response?.data?.detail,
    error?.response?.data?.message,
    error?.response?.data?.error,
    error?.response?.data?.title,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  const indicatesDuplicate =
    source.includes('exist') ||
    source.includes('already') ||
    source.includes('duplicate') ||
    source.includes('مسبق') ||
    source.includes('موجود') ||
    source.includes('مستخدم')

  if (!indicatesDuplicate) return null

  if (
    source.includes('phone') ||
    source.includes('mobile') ||
    source.includes('رقم الهاتف') ||
    source.includes('الهاتف') ||
    source.includes('بهذا الرقم')
  ) {
    return 'phoneNumber'
  }

  if (
    source.includes('email') ||
    source.includes('البريد الإلكتروني') ||
    source.includes('البريد الالكتروني') ||
    source.includes('البريد')
  ) {
    return 'email'
  }

  return null
}

const applyValidationErrors = (
  error: any,
  setFieldError: (name: keyof RegisterFormValues, message: string) => void,
) => {
  const errors = error?.response?.data?.errors

  if (!errors || Array.isArray(errors) || typeof errors !== 'object') return false

  let hasMappedError = false

  Object.entries(errors).forEach(([field, messages]) => {
    const firstMessage = Array.isArray(messages) ? messages[0] : undefined

    if (!firstMessage) return

    const normalizedField =
      `${field.charAt(0).toLowerCase()}${field.slice(1)}` as keyof RegisterFormValues

    setFieldError(normalizedField, firstMessage)
    hasMappedError = true
  })

  return hasMappedError
}

export default function ClientPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const formRef = useRef<RegisterFormRef>(null)

  const id = params?.id as string
  const mode = (searchParams.get('mode') ?? 'view') as 'view' | 'edit' | 'add'

  const typeParam = searchParams.get('type')

  const TYPE_KEY_TO_ENUM: Record<string, ClientType> = {
    client: ClientType.Client,
    merchant: ClientType.Merchant,
    partner: ClientType.Partner,
  }

  const TYPE_ENUM_TO_KEY: Record<ClientType, 'client' | 'merchant' | 'partner'> = {
    [ClientType.Client]: 'client',
    [ClientType.Merchant]: 'merchant',
    [ClientType.Partner]: 'partner',
    [ClientType.Admin]: 'client',
    [ClientType.ProfitAccount]: 'client',
    [ClientType.Charger]: 'client',
    [ClientType.Employee]: 'client',
  }

  const parsedType = (() => {
    if (!typeParam) return ClientType.Client

    const byKey = TYPE_KEY_TO_ENUM[typeParam.toLowerCase()]
    if (byKey !== undefined) return byKey

    const asNumber = Number(typeParam)
    if (!Number.isNaN(asNumber)) return asNumber as ClientType

    return ClientType.Client
  })()

  const clientType = parsedType
  const typeKey = TYPE_ENUM_TO_KEY[clientType] ?? 'client'

  const isAdd = id === 'new'

  const { selectedClient, loading, fetchClientById, updateClient } = useClientsStore()

  const { register, loading: addLoading } = useRegisterStore()

  /* =============================
     Load client in view/edit
  ============================== */

  useEffect(() => {
    if (!isAdd && id) {
      fetchClientById(id)
    }
  }, [id, isAdd, fetchClientById])

  /* =============================
     Submit Logic
  ============================== */

  const handleSubmit = async (data: RegisterFormValues, setFieldError: any) => {
    try {
      if (isAdd) {
        const createdId = await register(mapRegisterFormToDto(data, clientType))

        toast.success('تم الإنشاء بنجاح')

        router.replace(`/clients/${createdId}?type=${typeKey}&mode=view`)
      } else {
        await updateClient(id, mapRegisterFormToUpdateDto(data, clientType))

        toast.success('تم التحديث بنجاح')

        router.replace(`/clients/${id}?type=${typeKey}&mode=view`)
      }
    } catch (e: any) {
      if (applyValidationErrors(e, setFieldError)) return

      const duplicateField = getDuplicateField(e)

      if (duplicateField === 'phoneNumber') {
        setFieldError('phoneNumber', 'رقم الهاتف مستخدم مسبقاً')
        return
      }

      if (duplicateField === 'email') {
        setFieldError('email', 'البريد الإلكتروني مستخدم مسبقاً')
        return
      }

      toast.error(getErrorMessage(e, 'حدث خطأ غير متوقع'))
    }
  }

  /* =============================
     Loading state
  ============================== */

  if (!isAdd && (loading || !selectedClient)) {
    return <div>Loading...</div>
  }

  /* =============================
     UI
  ============================== */

  return (
    <FormPageContainer
      title={isAdd ? 'إضافة عميل' : (selectedClient?.firstName ?? 'عرض العميل')}
      mode={mode}
      breadcrumbs={[
        { label: 'العملاء', href: '/clients' },
        {
          label: isAdd ? 'إضافة' : (selectedClient?.firstName ?? ''),
        },
      ]}
      isDirty={formRef.current?.isDirty ?? false}
      loading={formRef.current?.isSubmitting ?? loading ?? addLoading}
      onEdit={() => router.push(`/clients/${id}/edit?type=${typeKey}`)}
      onCancel={() => router.replace('/clients')}
      onSave={() => formRef.current?.submit()}
      onDelete={() => console.log('delete')}
    >
      <RegisterForm
        ref={formRef}
        variant="clients"
        mode={mode}
        clientType={clientType}
        client={isAdd ? undefined : selectedClient}
        onSubmit={handleSubmit}
      />
    </FormPageContainer>
  )
}
