import {
  useEffect,
  useMemo,
} from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router'
import { useForm } from 'react-hook-form'
import {
  zodResolver,
} from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import {
  HADHRAMAUT_CITIES,
} from '@/features/client/constants'
import {
  applyServerErrors,
} from '@/lib/apply-server-errors'
import {
  isServerProblemDetailsError,
} from '@/shared/apis/server-problem-details'
import {
  useClient,
  useCreateClient,
  useUpdateClient,
} from '@/features/client/hooks'
import {
  ClientType,
} from '@/shared/types/ClientType'
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
import {
  BUSINESS_NATIONAL_ID_TYPE_OPTIONS,
} from '@/features/client/types'

import {
  mapMerchantToFormValues,
} from '../mappers'

import {
  getMerchantFormSchema,
  type MerchantFormValues,
} from '../schema'

const EMPTY_VALUES: MerchantFormValues = {
  FirstName: '',
  SecondName: '',
  ThirdName: '',
  LastName: '',
  NationalId: '',
  PhoneNumber: '',
  Address: '',
  City: '',
  NationalIdType: 2,

  Password: '',
  OrganizationName: '',
}

export default function MerchantFormPage() {
  const { id } = useParams<{
    id?: string
  }>()

  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const schema = useMemo(
    () => getMerchantFormSchema(isEdit),
    [isEdit],
  )

  const {
    data: existing,
    isLoading: isLoadingMerchant,
  } = useClient(id)

  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: {
      isSubmitting,
    },
  } = useForm<MerchantFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!isEdit) {
      reset(EMPTY_VALUES)
      return
    }

    if (!existing) return

    reset(
      mapMerchantToFormValues(existing),
    )
  }, [
    isEdit,
    existing,
    reset,
  ])

  const onSubmit = async (
    values: MerchantFormValues,
  ) => {
    clearErrors()

    const payload = {
      FirstName: values.FirstName,
      SecondName: values.SecondName,
      ThirdName: values.ThirdName,
      LastName: values.LastName,

      NationalId:
        values.NationalId || undefined,

      PhoneNumber:
        values.PhoneNumber,

      Address:
        values.Address || undefined,

      City: values.City,

      NationalIdType:
        values.NationalIdType,

      OrganizationName:
        values.OrganizationName.trim(),

      ClientType: ClientType.Merchant,

      // تُرسل كلمة المرور في الإضافة فقط.
      ...(!isEdit
        ? {
            Password: values.Password,
          }
        : {}),
    }

    try {
      if (isEdit && id) {
        await updateMutation.mutateAsync({
          id,
          payload,
        })
      } else {
        await createMutation.mutateAsync(
          payload,
        )
      }

      toast.success(
        isEdit
          ? 'تم التعديل بنجاح'
          : 'تم الحفظ بنجاح',
      )

      navigate(
        isEdit
          ? `/merchants/${id}`
          : '/merchants',
      )
    } catch (error) {
      console.error(
        'SAVE ERROR:',
        error,
      )

      if (
        !isServerProblemDetailsError(error)
      ) {
        toast.error(
          'حدث خطأ غير متوقع أثناء الحفظ',
        )

        return
      }

      applyServerErrors<MerchantFormValues>(
        error.errors,
        setError,
      )
    }
  }

  const isPageLoading =
    isEdit && isLoadingMerchant

  const isSaving =
    isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending

  return (
    <ClientFormLayout
      title={
        isEdit
          ? 'تعديل التاجر'
          : 'إضافة تاجر'
      }
      subtitle="املأ بيانات التاجر ثم اضغط حفظ"
      isLoading={isPageLoading}
      isSaving={isSaving}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate(-1)}
    >
      <SectionTitle>
        بيانات التاجر
      </SectionTitle>

      <ClientNameFields
        control={control}
        disabled={isSaving}
      />

      <ClientNationalIdField
        control={control}
        disabled={isSaving}
      />

      <ClientNationalIdTypeField
        control={control}
        disabled={isSaving}
        options={
          BUSINESS_NATIONAL_ID_TYPE_OPTIONS
        }
      />

      {!isEdit && (
        <ClientPasswordField
          control={control}
          disabled={isSaving}
        />
      )}

      <ClientOrganizationField
        control={control}
        disabled={isSaving}
      />

      <SectionDivider />

      <SectionTitle>
        بيانات التواصل
      </SectionTitle>

      <ClientPhoneField
        control={control}
        disabled={isSaving}
      />

      <ClientCitySelectField
        control={control}
        disabled={isSaving}
        cities={HADHRAMAUT_CITIES}
        guardedOpen
      />

      <ClientAddressField
        control={control}
        disabled={isSaving}
      />

      <SectionDivider />
    </ClientFormLayout>
  )
}