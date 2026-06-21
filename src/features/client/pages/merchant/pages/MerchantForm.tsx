import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import { HADHRAMAUT_CITIES } from '@/features/client/constants'
import { applyServerErrors } from '@/lib/apply-server-errors'
import { isServerProblemDetailsError } from '@/shared/apis/server-problem-details'
import {
  useUpdateClient,
  useCreateClient,
  useClient,
} from '@/features/client/hooks'
import { mapMerchantToFormValues } from '../mappers'
import { ClientType } from '@/shared/types/ClientType'
import {
  ClientAddressField,
  ClientCitySelectField,
  ClientFormLayout,
  ClientNameFields,
  ClientNationalIdField,
  ClientNationalIdTypeField,
  ClientOrganizationField,
  ClientPasswordField,
  ClientPhoneField,
  SectionDivider,
  SectionTitle,
} from '@/features/client/components/ClientForm'
import { BUSINESS_NATIONAL_ID_TYPE_OPTIONS } from '@/features/client/types'

export type FormValues = {
  FirstName: string
  SecondName: string
  ThirdName: string
  LastName: string
  NationalId?: string
  Password?: string
  PhoneNumber: string
  Address: string
  City: string
  NationalIdType: number
  OrganizationName?: string | null
}

const EMPTY_VALUES: FormValues = {
  FirstName: '',
  SecondName: '',
  ThirdName: '',
  LastName: '',
  NationalId: '',
  Password: '',
  PhoneNumber: '',
  Address: '',
  City: '',
  NationalIdType: 2,
  OrganizationName: '',
}

export default function MerchantFormPage() {
  const { id } = useParams() as { id?: string }
  const isEdit = Boolean(id)

  const navigate = useNavigate()
  const { data: existing, isLoading: isLoadingBeneficiary } = useClient(id)
  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()

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
      reset(mapMerchantToFormValues(existing))
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
      OrganizationName: values.OrganizationName?.trim(),
      ClientType: ClientType.Merchant,

      ...(!isEdit ? { Password: values.Password } : {}),
    }

    try {
      await (isEdit && id
        ? updateMutation.mutateAsync({ id, payload })
        : createMutation.mutateAsync(payload))

      toast.success(isEdit ? 'تم التعديل بنجاح' : 'تم الحفظ بنجاح')
      navigate(!isEdit ? '/merchants' : '/merchants/' + id)

    } catch (error) {
      console.error('SAVE ERROR:', error)

      if (!isServerProblemDetailsError(error)) {
        toast.error('حدث خطأ غير متوقع أثناء الحفظ')
        return
      }

      applyServerErrors<FormValues>(
        error.errors,
        setError,
      )
    }
  }

  const isPageLoading = isLoadingBeneficiary
  const isSaving = isSubmitting || createMutation.isPending || updateMutation.isPending

  return (
    <ClientFormLayout
      title={isEdit ? 'تعديل التاجر' : 'إضافة تاجر'}
      subtitle="املأ بيانات التاجر ثم اضغط حفظ"
      isLoading={isPageLoading}
      isSaving={isSaving}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate(-1)}
    >
      <SectionTitle>بيانات التاجر</SectionTitle>

      <ClientNameFields control={control} disabled={isSaving} />

      <ClientNationalIdField control={control} disabled={isSaving} />

      <ClientNationalIdTypeField
        control={control}
        disabled={isSaving}
        options={BUSINESS_NATIONAL_ID_TYPE_OPTIONS}
      />

      {!isEdit && (
        <ClientPasswordField control={control} disabled={isSaving} />
      )}

      <ClientOrganizationField control={control} disabled={isSaving} />

      <SectionDivider />

      <SectionTitle>بيانات التواصل</SectionTitle>

      <ClientPhoneField control={control} disabled={isSaving} />

      <ClientCitySelectField
        control={control}
        disabled={isSaving}
        cities={HADHRAMAUT_CITIES}
        guardedOpen
      />

      <ClientAddressField control={control} disabled={isSaving} />

      <SectionDivider />
    </ClientFormLayout>
  )
}