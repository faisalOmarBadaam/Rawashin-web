import { useEffect, useMemo } from 'react'
import {
  useNavigate,
  useParams,
} from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

import ControlledAutocomplete from '@/shared/components/ui/ControlledAutocomplete'
import { ClientType } from '@/shared/types/ClientType'
import { HADHRAMAUT_CITIES } from '@/features/client/constants'
import { applyServerErrors } from '@/lib/apply-server-errors'
import { isServerProblemDetailsError } from '@/shared/apis/server-problem-details'

import { mapBeneficiaryToFormValues } from './mappers'

import {
  getBeneficiaryFormSchema,
  type BeneficiaryFormValues,
} from './schema'

import {
  useClient,
  useClientLookup,
  useCreateClient,
  useUpdateClient,
} from '../../hooks'

import type {
  ClientLookupResponse,
} from '../../types/responses'

import {
  INDIVIDUAL_NATIONAL_ID_TYPE_OPTIONS,
} from '../../types'

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
} from '../../components/ClientForm'

const EMPTY_VALUES: BeneficiaryFormValues = {
  FirstName: '',
  SecondName: '',
  ThirdName: '',
  LastName: '',
  NationalId: '',
  PhoneNumber: '',
  Address: '',
  City: '',
  NationalIdType: null,

  Password: '',
  ParentClientId: null,
}

export default function BeneficiaryForm() {
  const { id } = useParams<{
    id?: string
  }>()

  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const schema = useMemo(
    () => getBeneficiaryFormSchema(isEdit),
    [isEdit],
  )

  const {
    data: existing,
    isLoading: isLoadingBeneficiary,
  } = useClient(id)

  const {
    data: beneficiaryLookupOptions,
    isLoading:
      isLoadingBeneficiaryLookup,
  } = useClientLookup(ClientType.Partner)

  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()

  const beneficiaryOptions = useMemo(
    () => beneficiaryLookupOptions ?? [],
    [beneficiaryLookupOptions],
  )

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<BeneficiaryFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!isEdit) {
      reset(EMPTY_VALUES)
      return
    }

    if (!existing) return

    const formValues =
      mapBeneficiaryToFormValues(
        existing,
        beneficiaryOptions,
      )

    reset(formValues)
  }, [
    isEdit,
    existing,
    beneficiaryOptions,
    reset,
  ])

  const onSubmit = async (
    values: BeneficiaryFormValues,
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
        values.PhoneNumber || undefined,

      Address:
        values.Address || undefined,

      City: values.City,

      NationalIdType:
        values.NationalIdType ?? undefined,

      ParentClientId:
        values.ParentClientId?.id,

      ClientType: ClientType.Client,

      /**
       * كلمة المرور تُرسل فقط
       * عند إضافة مستفيد جديد.
       */
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
          ? `/beneficiaries/${id}`
          : '/beneficiaries',
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
          'حدث خطأ أثناء حفظ البيانات',
        )

        return
      }

      applyServerErrors<BeneficiaryFormValues>(
        error.errors,
        setError,
      )
    }
  }

  const isPageLoading =
    isEdit && isLoadingBeneficiary

  const isSaving =
    isSubmitting ||
    createMutation.isPending ||
    updateMutation.isPending

  return (
    <ClientFormLayout
      title={
        isEdit
          ? 'تعديل المستفيد'
          : 'إضافة مستفيد'
      }
      subtitle="املأ بيانات المستفيد ثم اضغط حفظ"
      isLoading={isPageLoading}
      isSaving={isSaving}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate(-1)}
    >
      <SectionTitle>
        بيانات المستفيد
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
          INDIVIDUAL_NATIONAL_ID_TYPE_OPTIONS
        }
      />

      {!isEdit && (
        <ClientPasswordField
          control={control}
          disabled={isSaving}
        />
      )}

      <Box>
        <ControlledAutocomplete<
          BeneficiaryFormValues,
          ClientLookupResponse
        >
          control={control}
          name="ParentClientId"
          label="جهة المستفيد"
          options={beneficiaryOptions}
          loading={
            isLoadingBeneficiaryLookup
          }
          disabled={isSaving}
          placeholder="اختر جهة المستفيد"
          getOptionLabel={(
            option,
          ) => option.name ?? ''}
        />

        {errors.ParentClientId
          ?.message && (
          <Typography
            variant="caption"
            color="error"
            sx={{
              display: 'block',
              mt: 0.5,
              mx: '14px',
            }}
          >
            {String(
              errors.ParentClientId
                .message,
            )}
          </Typography>
        )}
      </Box>

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
      />

      <ClientAddressField
        control={control}
        disabled={isSaving}
      />

      <SectionDivider />
    </ClientFormLayout>
  )
}