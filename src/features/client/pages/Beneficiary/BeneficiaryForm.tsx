import { useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'


import ControlledAutocomplete from '@/shared/components/ui/ControlledAutocomplete'
import { ClientType } from '@/shared/types/ClientType'
import { HADHRAMAUT_CITIES } from '@/features/client/constants'
import { mapBeneficiaryToFormValues } from './mappers'
import { applyServerErrors } from '@/lib/apply-server-errors'
import { isServerProblemDetailsError } from '@/shared/apis/server-problem-details'
import { useClient, useClientLookup, useCreateClient, useUpdateClient } from '../../hooks'
import type { ClientLookupResponse } from '../../types/responses'
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
import { INDIVIDUAL_NATIONAL_ID_TYPE_OPTIONS } from '../../types'

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
  ParentClientId?: ClientLookupResponse | null
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
  ParentClientId: null,
}

export default function BeneficiaryForm() {
  const { id } = useParams() as { id?: string }
  const isEdit = Boolean(id)

  const navigate = useNavigate()

  const { data: existing, isLoading: isLoadingBeneficiary } = useClient(id)

  const { data: beneficiaryLookupOptions, isLoading: isLoadingBeneficiaryLookup } =
    useClientLookup(ClientType.Partner)

  const createMutation = useCreateClient()
  const updateMutation = useUpdateClient()

  const beneficiaryOptions = useMemo(
    () => beneficiaryLookupOptions ?? [],
    [beneficiaryLookupOptions]
  )

  const {
    control,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: EMPTY_VALUES,
  })

  useEffect(() => {
    if (!isEdit) {
      reset(EMPTY_VALUES)
      return
    }

    if (existing) {
      reset(mapBeneficiaryToFormValues(existing, beneficiaryOptions))
    }
  }, [isEdit, existing, beneficiaryOptions, reset])

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
      ParentClientId: values.ParentClientId?.id,
      ClientType: ClientType.Client,
      ...(!isEdit ? { Password: values.Password } : {}),
    }
    
    try {
      await (isEdit && id
        ? updateMutation.mutateAsync({ id, payload })
        : createMutation.mutateAsync(payload))

      toast.success(isEdit ? 'تم التعديل بنجاح' : 'تم الحفظ بنجاح')
      navigate(!isEdit ? '/beneficiaries' : '/beneficiaries/' + id)
    } catch (error) {
        console.error('SAVE ERROR:', error)
      if (!isServerProblemDetailsError(error)) return

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
      title={isEdit ? 'تعديل المستفيد' : 'إضافة مستفيد'}
      subtitle="املأ بيانات المستفيد ثم اضغط حفظ"
      isLoading={isPageLoading}
      isSaving={isSaving}
      onSubmit={handleSubmit(onSubmit)}
      onCancel={() => navigate(-1)}
    >
      <SectionTitle>بيانات المستفيد</SectionTitle>

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

      <Box>
        <ControlledAutocomplete
          control={control}
          name="ParentClientId"
          label="جهة المستفيد"
          options={beneficiaryOptions}
          loading={isLoadingBeneficiaryLookup}
          disabled={isSaving}
          placeholder="اختر جهة المستفيد"
          getOptionLabel={(option: ClientLookupResponse) =>
            option.name ?? ''
          }
        />
        {errors.ParentClientId?.message && (
          <Typography
            variant="caption"
            color="error"
            sx={{ display: 'block', mt: 0.5, mx: '14px' }}
          >
            {errors.ParentClientId.message}
          </Typography>
        )}
      </Box>

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


