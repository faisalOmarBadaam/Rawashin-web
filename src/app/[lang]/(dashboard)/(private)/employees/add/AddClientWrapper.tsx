'use client'

import { useRef } from 'react'

import { useRouter } from 'next/navigation'

import { toast } from 'react-toastify'

import { getClientTypeRouteKey } from '@/core/policy/clientType.matrix'
import PageContainer from '@/layout/PageContainer'

import { useAuthStore } from '@/contexts/auth/auth.store'
import { useRegisterStore } from '@/contexts/clients/register.store'
import RegisterForm, {
  type RegisterFormRef,
} from '@/domains/clients/components/ClientForm/RegisterForm'
import { mapRegisterFormToDto } from '@/domains/clients/utils/register.mapper'
import type { RegisterFormValues } from '@/domains/clients/utils/register.schema'
import { getErrorMessage } from '@/libs/api/getErrorMessage'
import type { ClientType } from '@/types/api/clients'

const decodeToken = (token: string) => {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

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

type Props = {
  clientType: ClientType
  title: string
}

export default function AddClientWrapper({ clientType, title }: Props) {
  const router = useRouter()
  const formRef = useRef<RegisterFormRef>(null)
  const roles = useAuthStore(state => state.session?.roles ?? [])

  const { register, loading } = useRegisterStore()

  const handleSubmit = async (data: RegisterFormValues, setFieldError: any) => {
    try {
      const res: any = await register(mapRegisterFormToDto(data, clientType))

      toast.success('تم الإنشاء بنجاح')

      const token = res?.accessToken
      let newClientId = res?.id || res?.userId

      if (!newClientId && token) {
        const payload = decodeToken(token)
        if (payload) {
          newClientId =
            payload.sub ||
            payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ||
            payload.id ||
            payload.userId
        }
      }

      if (newClientId) {
        const typeKey = getClientTypeRouteKey('clients', clientType)
        router.replace(`/employees/${newClientId}/view?type=${typeKey}`)
      } else {
        router.replace('/employees')
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

  return (
    <PageContainer
      title={title}
      mode="add"
      resource="clients"
      roles={roles}
      breadcrumbs={[{ label: 'العملاء', href: '/employees' }, { label: title }]}
      dirty={formRef.current?.isDirty}
      loading={loading}
      onUndo={() => formRef.current?.resetForm()}
      onCancel={() => router.back()}
      onSave={() => formRef.current?.submit()}
    >
      <PageContainer.Grid>
        <PageContainer.Col xs={12}>
          <RegisterForm
            ref={formRef}
            variant="employees"
            mode="add"
            clientType={clientType}
            onSubmit={handleSubmit}
          />
        </PageContainer.Col>
      </PageContainer.Grid>
    </PageContainer>
  )
}
