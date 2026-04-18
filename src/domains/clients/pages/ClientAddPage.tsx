'use client'

import { useEffect, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import Stack from '@mui/material/Stack'
import { toast } from 'react-toastify'

import { useAuthStore } from '@/contexts/auth/auth.store'
import { useClientsStore } from '@/contexts/clients/clients.store'
import { useRegisterStore } from '@/contexts/clients/register.store'
import RegisterForm, {
  type RegisterFormRef,
} from '@/domains/clients/components/ClientForm/RegisterForm'
import { mapRegisterFormToDto } from '@/domains/clients/utils/register.mapper'
import type { RegisterFormValues } from '@/domains/clients/utils/register.schema'
import type { ClientVariant } from '@/domains/clients/variants/clientVariants'
import { applyVariantToCreateOrUpdateDto } from '@/domains/clients/variants/clientVariants'
import FormPageContainer from '@/layout/FormPageContainer'
import PageContainer from '@/layout/PageContainer'
import { getErrorMessage } from '@/libs/api/getErrorMessage'
import { ClientType, type SubMerchantRequestDto } from '@/types/api/clients'

type Props = {
  variant: ClientVariant
  clientType: ClientType
  title: string
}

const SUCCESS_MESSAGES: Record<ClientType, string> = {
  [ClientType.Client]: 'تم إنشاء المستفيد بنجاح',
  [ClientType.Merchant]: 'تم إنشاء نقطة البيع بنجاح',
  [ClientType.Partner]: 'تم إنشاء الشريك بنجاح',
  [ClientType.Admin]: '',
  [ClientType.ProfitAccount]: '',
  [ClientType.Charger]: '',
  [ClientType.Employee]: '',
}

const USERS_SUCCESS_MESSAGE = 'تم إنشاء الحساب بنجاح'
const EMPTY_ROLES: string[] = []

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

export default function ClientAddPage({ variant, clientType, title }: Props) {
  const router = useRouter()
  const formRef = useRef<RegisterFormRef>(null)
  const session = useAuthStore(state => state.session)
  const roles = session?.roles ?? EMPTY_ROLES
  const [formDirty, setFormDirty] = useState(false)
  const createSubMerchant = useClientsStore(state => state.createSubMerchant)

  const { register, loading, success, reset } = useRegisterStore()

  const handleSubmit = async (
    data: RegisterFormValues,
    setFieldError: (name: keyof RegisterFormValues, message: string) => void,
  ) => {
    try {
      if (variant === 'merchants') {
        const merchantId = session?.userId

        if (!merchantId) {
          toast.error('تعذر تحديد حساب نقطة البيع الحالي')
          return
        }

        const payload: SubMerchantRequestDto = {
          nationalId: data.nationalId?.trim() ?? '',
          firstName: data.firstName.trim(),
          secondName: data.secondName.trim(),
          thirdName: data.thirdName.trim(),
          lastName: data.lastName.trim(),
          phoneNumber: data.phoneNumber.trim(),
          address: data.address?.trim() ?? '',
          city: data.city?.trim() ?? '',
          password: data.password?.trim() ?? '',
        }

        const created = await createSubMerchant(merchantId, payload)
        const createdId =
          (created as any)?.id ??
          (created as any)?.clientId ??
          (created as any)?.subMerchantId ??
          (created as any)?.data?.id ??
          (created as any)?.data?.clientId ??
          (created as any)?.data?.subMerchantId

        toast.success('تم إنشاء التابع بنجاح')

        if (createdId) {
          router.push(`/merchants/${createdId}/view?type=merchant`)
          return
        }

        router.push('/merchants?type=merchant')

        return
      }

      const dto = mapRegisterFormToDto(data, clientType)
      const finalDto = applyVariantToCreateOrUpdateDto(variant, dto)

      await register(finalDto)
    } catch (e: any) {
      if (applyValidationErrors(e, setFieldError)) return

      const duplicateField = getDuplicateField(e)

      if (duplicateField === 'phoneNumber') {
        if (variant === 'clients') {
          toast.error('رقم الهاتف مستخدم مسبقاً')
        } else {
          setFieldError('phoneNumber', 'رقم الهاتف مستخدم مسبقاً')
        }
        return
      }

      if (duplicateField === 'email') {
        if (variant === 'clients') {
          toast.error('البريد الإلكتروني مستخدم مسبقاً')
        } else {
          setFieldError('email', 'البريد الإلكتروني مستخدم مسبقاً')
        }
        return
      }

      toast.error(getErrorMessage(e, 'حدث خطأ غير متوقع'))
    }
  }

  useEffect(() => {
    if (!success) return

    if (variant === 'users') {
      toast.success(USERS_SUCCESS_MESSAGE)
    } else {
      toast.success(SUCCESS_MESSAGES[clientType])
    }

    reset()

    if (variant === 'employees') {
      router.push('/employees')
      return
    }

    if (variant === 'users') {
      router.push('/users')
      return
    }

    router.push('/clients')
  }, [success, variant, clientType, reset, router])

  if (variant === 'employees') {
    return (
      <Stack spacing={3}>
        <RegisterForm
          ref={formRef}
          variant={variant}
          mode="add"
          clientType={clientType}
          loading={loading}
          onSubmit={handleSubmit}
        />
      </Stack>
    )
  }

  if (variant === 'users') {
    return (
      <PageContainer
        title={title}
        mode="add"
        resource="users"
        roles={roles}
        clientType={clientType}
        breadcrumbs={[{ label: 'إدارة المستخدمين', href: '/users' }, { label: title }]}
        dirty={formDirty}
        loading={loading}
        onUndo={() => formRef.current?.resetForm()}
        onCancel={() => router.back()}
        onSave={() => formRef.current?.submit()}
      >
        <PageContainer.Grid>
          <PageContainer.Col xs={12}>
            <Stack spacing={3}>
              <RegisterForm
                ref={formRef}
                variant={variant}
                mode="add"
                clientType={clientType}
                loading={loading}
                onSubmit={handleSubmit}
                onFormStateChange={({ isDirty }) => setFormDirty(isDirty)}
              />
            </Stack>
          </PageContainer.Col>
        </PageContainer.Grid>
      </PageContainer>
    )
  }

  if (variant === 'merchants') {
    return (
      <FormPageContainer
        title={title}
        mode="add"
        breadcrumbs={[{ label: 'نقاط البيع', href: '/merchants' }, { label: 'إضافة  حساب فرعي' }]}
        isDirty={formRef.current?.isDirty}
        loading={formRef.current?.isSubmitting}
        onCancel={() => router.back()}
        onSave={() => formRef.current?.submit()}
      >
        <RegisterForm
          ref={formRef}
          variant={variant}
          mode="add"
          clientType={clientType}
          onSubmit={handleSubmit}
        />
      </FormPageContainer>
    )
  }

  return (
    <FormPageContainer
      title={title}
      mode="add"
      breadcrumbs={[{ label: 'العملاء', href: '/clients' }, { label: 'إضافة عميل' }]}
      isDirty={formRef.current?.isDirty}
      loading={formRef.current?.isSubmitting || loading}
      onCancel={() => router.back()}
      onSave={() => formRef.current?.submit()}
    >
      <RegisterForm
        ref={formRef}
        variant={variant}
        mode="add"
        clientType={clientType}
        onSubmit={handleSubmit}
      />
    </FormPageContainer>
  )
}
