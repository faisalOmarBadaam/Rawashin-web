'use client'

import { useRef } from 'react'

import { useRouter } from 'next/navigation'

import { toast } from 'react-toastify'

import { useAuthStore } from '@/contexts/auth/auth.store'
import { useClientsStore } from '@/contexts/clients/clients.store'
import RegisterForm, {
  type RegisterFormRef,
} from '@/domains/clients/components/ClientForm/RegisterForm'
import type { RegisterFormValues } from '@/domains/clients/utils/register.schema'
import PageContainer from '@/layout/PageContainer'
import { getErrorMessage } from '@/libs/api/getErrorMessage'
import type { SubMerchantRequestDto } from '@/types/api/clients'
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

export default function AddSubMerchantWrapper() {
  const router = useRouter()
  const formRef = useRef<RegisterFormRef>(null)
  const session = useAuthStore(state => state.session)
  const createSubMerchant = useClientsStore(state => state.createSubMerchant)

  const handleSubmit = async (data: RegisterFormValues, setFieldError: any) => {
    try {
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
        router.replace(`/merchants/${createdId}/view?type=merchant`)
        return
      }

      router.replace('/merchants?type=merchant')
    } catch (e: any) {
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
      title="إضافة  حساب فرعي"
      mode="add"
      clientType={ClientType.Merchant}
      breadcrumbs={[
        { label: 'الحسابات الفرعية', href: '/merchants' },
        { label: 'إضافة حساب فرعي' },
      ]}
      dirty={formRef.current?.isDirty}
      loading={formRef.current?.isSubmitting}
      onUndo={() => formRef.current?.resetForm()}
      onCancel={() => router.back()}
      onSave={() => formRef.current?.submit()}
    >
      <PageContainer.Grid>
        <PageContainer.Col xs={12}>
          <RegisterForm
            ref={formRef}
            variant="merchants"
            mode="add"
            clientType={ClientType.Merchant}
            onSubmit={handleSubmit}
          />
        </PageContainer.Col>
      </PageContainer.Grid>
    </PageContainer>
  )
}
