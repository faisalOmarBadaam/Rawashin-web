import { useEffect, useMemo } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { ClientType } from '@/shared/types/ClientType'
import { HADHRAMAUT_CITIES } from '@/features/client/constants'
import { applyServerErrors } from '@/lib/apply-server-errors'
import { isServerProblemDetailsError } from '@/shared/apis/server-problem-details'
import {
  useClient,
  useCreateClient,
  useUpdateClient,
} from '@/features/client/hooks'
import {
  ClientAddressField,
  ClientCitySelectField,
  ClientFormLayout,
  ClientNameFields,
  ClientNationalIdField,
  ClientNationalIdTypeField,
  ClientPasswordField,
  ClientPhoneField,
  SectionDivider,
  SectionTitle,
} from '@/features/client/components/ClientForm'
import { INDIVIDUAL_NATIONAL_ID_TYPE_OPTIONS } from '@/features/client/types'
import { mapUserToFormValues } from '../mappers'
import type { ClientListResponse } from '@/features/client/types/responses'

export type FormValues = {
  FirstName: string
  SecondName: string
  ThirdName: string
  LastName: string
  NationalId?: string
  Password?: string
  PhoneNumber?: string
  Address?: string
  City: string
  NationalIdType?: number | null
}

const EMPTY_VALUES: FormValues = {
  FirstName: '',
  SecondName : '',
  ThirdName: '',
  LastName: '',
  NationalId: '',
  Password: '',
  PhoneNumber: '',
  Address: '',
  City: '',
  NationalIdType: null,
}

const supportedUserClientTypes = [
  ClientType.Admin,
  ClientType.ProfitAccount,
  ClientType.Charger,
  ClientType.Employee,
] as const

const clientTypeLabels: Record<number, string> = {
  [ClientType.Admin]: 'مدير النظام',
  [ClientType.ProfitAccount]: 'حساب الأرباح',
  [ClientType.Charger]: 'حساب الشحن',
  [ClientType.Employee]: 'حساب المستخدم',
}

function parseClientType(value: string | null) {
  if (!value) return null

  const parsed = Number(value)

  if (Number.isNaN(parsed)) {
    return null
  }

  return supportedUserClientTypes.includes(
    parsed as (typeof supportedUserClientTypes)[number],
  )
    ? parsed
    : null
}

export default function UserForm() {
  const { id } = useParams() as { id?: string }
  const isEdit = Boolean(id)

  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const { data: existing, isLoading: isLoadingClient } = useClient(id)

  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()

  const requestedClientType = useMemo(
    () => parseClientType(searchParams.get('ClientType')),
    [searchParams],
  )

  const existingClientType = useMemo(() => {
    const value = (existing as ClientListResponse & { clientType?: unknown } | undefined)?.clientType

    return typeof value === 'number' ? parseClientType(String(value)) : null
  }, [existing])

  const resolvedClientType = existingClientType ?? requestedClientType ?? ClientType.Admin
  const clientTypeLabel = clientTypeLabels[resolvedClientType] ?? 'المستخدم'
  const usersListPath = requestedClientType
    ? `/users?ClientType=${requestedClientType}`
    : '/users'


  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!isEdit) {
      reset(EMPTY_VALUES)
      return
    }

    if (existing) {
      reset(mapUserToFormValues(existing))
    }
  }, [isEdit, existing, reset])

  const onSubmit = async (values: FormValues) => {
    clearErrors()

    const payload = {
      FirstName: values.FirstName,
      SecondName: values.SecondName,
      ThirdName: values.ThirdName,
      LastName: values.LastName,
      NationalId: values.NationalId,
      PhoneNumber: values.PhoneNumber,
      Address: values.Address,
      City: values.City,
      NationalIdType: values.NationalIdType ?? undefined,
      ClientType: resolvedClientType,
      ...(!isEdit ? { Password: values.Password } : {}),
    }
    
    try {
      await (isEdit && id
        ? updateMutation.mutateAsync({ id, payload })
        : createMutation.mutateAsync(payload))

      toast.success(isEdit ? 'تم التعديل بنجاح' : 'تم الحفظ بنجاح')
      navigate(usersListPath)
    } catch (error) {
      console.error('SAVE ERROR:', error)
      if (!isServerProblemDetailsError(error)) return

      applyServerErrors<FormValues>(
        error.errors,
        setError,
      )
    }
  }

  const isPageLoading = isLoadingClient
  const isSaving = isSubmitting || createMutation.isPending || updateMutation.isPending

  return (
    <ClientFormLayout
      title={isEdit ? `تعديل ${clientTypeLabel}` : `إضافة ${clientTypeLabel}`}
      subtitle={`املأ بيانات ${clientTypeLabel} ثم اضغط حفظ`}
      isLoading={isPageLoading}
      isSaving={isSaving}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate(-1)}
    >
      <SectionTitle>{`بيانات ${clientTypeLabel}`}</SectionTitle>

      <ClientNameFields control={control} disabled={isSaving} />

      <ClientNationalIdField control={control} disabled={isSaving} />

      <ClientNationalIdTypeField
        control={control}
        disabled={isSaving}
        options={INDIVIDUAL_NATIONAL_ID_TYPE_OPTIONS}
      />

      {!isEdit && (
        <ClientPasswordField control={control} disabled={isSaving} />
      )}


      <SectionDivider />

      <SectionTitle>بيانات التواصل</SectionTitle>

      <ClientPhoneField control={control} disabled={isSaving} />

      <ClientCitySelectField
        control={control}
        disabled={isSaving}
        cities={HADHRAMAUT_CITIES}
      />

      <ClientAddressField control={control} disabled={isSaving} />

      <SectionDivider />
    </ClientFormLayout>
  )
}


