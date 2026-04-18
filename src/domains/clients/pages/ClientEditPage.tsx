'use client'

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { toast } from 'react-toastify'

import ClientBalanceCompact from '@/components/ClientBalanceCompact'
import ClientDebtBalanceCompact from '@/components/ClientDebtBalanceCompact'
import { AppRole } from '@/configs/roles'
import { useAuthStore } from '@/contexts/auth/auth.store'
import { useClientsStore } from '@/contexts/clients/clients.store'
import { useRolesStore } from '@/contexts/roles/roles.store'
import { getClientTypeRouteKey } from '@/core/policy/clientType.matrix'
import type { SmartActionPermissionMap } from '@/core/topbar/smart-topbar.types'
import RegisterForm, {
  type RegisterFormRef,
} from '@/domains/clients/components/ClientForm/RegisterForm'
import CreateCommissionDialog from '@/domains/clients/components/shared/AddMarchentCommission'
import AssignNewCardDialog from '@/domains/clients/components/shared/AssignNewCardDialog'
import CardPreviewDialog from '@/domains/clients/components/shared/CardPreviewDialog'
import ClientTransactionsDataGrid from '@/domains/clients/components/shared/ClientTransactionsDataGrid'
import DebtClientDialog from '@/domains/clients/components/shared/DebtClientDialog'
import DepositDialog from '@/domains/clients/components/shared/DepositDialog'
import RefillChargerDialog from '@/domains/clients/components/shared/RefillChargerDialog'
import AttachmentsManager from '@/domains/clients/components/shared/attachments/AttachmentsManager'
import { mapRegisterFormToUpdateDto } from '@/domains/clients/utils/register.mapper'
import type { RegisterFormValues } from '@/domains/clients/utils/register.schema'
import type { ClientVariant } from '@/domains/clients/variants/clientVariants'
import { applyVariantToCreateOrUpdateDto } from '@/domains/clients/variants/clientVariants'
import PageContainer from '@/layout/PageContainer'
import { getErrorMessage } from '@/libs/api/getErrorMessage'
import type { UpdateSubMerchantRequestDto } from '@/types/api/clients'
import { ClientType } from '@/types/api/clients'

type Props = {
  variant: ClientVariant
  clientId: string
  clientType: ClientType
  title: string
  mode: 'view' | 'edit'
  onFormStateChange?: (state: { isDirty: boolean; isSubmitting: boolean }) => void
}

export type ViewEditClientRef = {
  submit: () => void
  resetForm: () => void
  openPrintPreview: () => void
  openAssignCardDialog: () => void
}

const EMPTY_ROLES: string[] = []

const CLIENTS_SUCCESS_MESSAGES: Record<ClientType, string> = {
  [ClientType.Client]: 'تم تحديث بيانات المستفيد بنجاح',
  [ClientType.Merchant]: 'تم تحديث بيانات نقطة البيع بنجاح',
  [ClientType.Partner]: 'تم تحديث بيانات الشريك بنجاح',
  [ClientType.Admin]: '',
  [ClientType.ProfitAccount]: '',
  [ClientType.Charger]: '',
  [ClientType.Employee]: '',
}

const USERS_SUCCESS_MESSAGE = 'تم تحديث الحساب بنجاح'

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

const CLIENTS_TOPBAR_PERMISSIONS: SmartActionPermissionMap = {
  attachments: 'update',
  print: 'update',
  assign: 'update',
  debt: 'update',
}

const USERS_TOPBAR_PERMISSIONS: SmartActionPermissionMap = {
  attachments: 'update',
  deposit: 'update',
  chargeCharger: 'update',
}

const CLIENT_TYPE_TO_USERS_KEY: Record<ClientType, 'admin' | 'charger' | 'profit' | 'employee'> = {
  [ClientType.Client]: 'admin',
  [ClientType.Merchant]: 'admin',
  [ClientType.Partner]: 'admin',
  [ClientType.Admin]: 'admin',
  [ClientType.ProfitAccount]: 'profit',
  [ClientType.Charger]: 'charger',
  [ClientType.Employee]: 'employee',
}

const ClientEditPage = forwardRef<ViewEditClientRef, Props>(function ClientEditPage(
  { variant, clientId, clientType, title, mode, onFormStateChange },
  ref,
) {
  const router = useRouter()
  const formRef = useRef<RegisterFormRef>(null)
  const roles = useAuthStore(state => state.session?.roles ?? EMPTY_ROLES)
  const isCurrentUserAdmin = roles.includes(AppRole.Admin)
  const clientTypeKey = getClientTypeRouteKey('clients', clientType)
  const usersTypeKey = CLIENT_TYPE_TO_USERS_KEY[clientType] ?? 'admin'

  const [openAttachments, setOpenAttachments] = useState(false)
  const [openCardPreview, setOpenCardPreview] = useState(false)
  const [openAssignCardDialog, setOpenAssignCardDialog] = useState(false)
  const [openCommissionDialog, setOpenCommissionDialog] = useState(false)
  const [openDebtDialog, setOpenDebtDialog] = useState(false)
  const [openDepositDialog, setOpenDepositDialog] = useState(false)
  const [openRefillDialog, setOpenRefillDialog] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [formState, setFormState] = useState({ isDirty: false, isSubmitting: false })
  const [refreshVersion, setRefreshVersion] = useState(0)

  const selectedClient = useClientsStore(state => state.selectedClient)
  const fetchClientById = useClientsStore(state => state.fetchClientById)
  const updateClient = useClientsStore(state => state.updateClient)
  const deleteClient = useClientsStore(state => state.deleteClient)
  const updateSubMerchant = useClientsStore(state => state.updateSubMerchant)
  const deleteSubMerchant = useClientsStore(state => state.deleteSubMerchant)
  const selectedUserRoles = useRolesStore(state => state.clientRoles)
  const fetchUserRoles = useRolesStore(state => state.fetchClientRoles)

  const handleFormStateChange = useCallback(
    (state: { isDirty: boolean; isSubmitting: boolean }) => {
      setFormState(state)
      onFormStateChange?.(state)
    },
    [onFormStateChange],
  )

  useEffect(() => {
    let active = true

    const loadClient = async () => {
      setInitialLoading(true)

      try {
        await fetchClientById(clientId)
      } finally {
        if (active) {
          setInitialLoading(false)
        }
      }
    }

    loadClient()

    return () => {
      active = false
    }
  }, [clientId, fetchClientById])

  useEffect(() => {
    if (variant !== 'users') return

    fetchUserRoles(clientId)
  }, [clientId, fetchUserRoles, variant])

  const handleSubmit = useCallback(
    async (
      data: RegisterFormValues,
      setFieldError: (name: keyof RegisterFormValues, message: string) => void,
    ) => {
      try {
        const dto = mapRegisterFormToUpdateDto(data, clientType)
        const finalDto = applyVariantToCreateOrUpdateDto(variant, dto)

        if (variant === 'merchants') {
          const merchantId = useAuthStore.getState().session?.userId

          if (!merchantId) {
            toast.error('تعذر تحديد حساب نقطة البيع الحالي')
            return
          }

          const payload: UpdateSubMerchantRequestDto = {
            firstName: data.firstName || null,
            secondName: data.secondName || null,
            thirdName: data.thirdName || null,
            lastName: data.lastName || null,
            phoneNumber: data.phoneNumber || null,
            address: data.address || null,
            city: data.city || null,
          }

          await updateSubMerchant(merchantId, clientId, payload)

          toast.success('تم تحديث بيانات التابع بنجاح')
          router.replace(`/merchants/${clientId}/view?type=merchant`)

          return
        }

        await updateClient(clientId, finalDto)

        if (variant === 'users') {
          toast.success(USERS_SUCCESS_MESSAGE)
          router.replace(`/users/${clientId}?type=${usersTypeKey}&mode=view`)
          return
        }

        toast.success(CLIENTS_SUCCESS_MESSAGES[clientType])

        if (variant === 'employees') {
          router.push('/clients')
          return
        }

        router.replace(`/clients/${clientId}/view?type=${clientTypeKey}`)
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
    },
    [
      clientId,
      clientType,
      clientTypeKey,
      router,
      updateClient,
      updateSubMerchant,
      usersTypeKey,
      variant,
    ],
  )

  const handleDelete = useCallback(async () => {
    try {
      setDeleting(true)

      if (variant === 'merchants') {
        const merchantId = useAuthStore.getState().session?.userId

        if (!merchantId) {
          toast.error('تعذر تحديد حساب نقطة البيع الحالي')
          return
        }

        await deleteSubMerchant(merchantId, clientId)
        toast.success('تم حذف التابع بنجاح')
        router.replace('/merchants')

        return
      }

      await deleteClient(clientId)
      toast.success('تم حذف العميل بنجاح')
      router.replace(variant === 'users' ? '/users' : '/clients')
    } catch (e: any) {
      toast.error(getErrorMessage(e, 'تعذر حذف العميل'))
    } finally {
      setDeleting(false)
    }
  }, [clientId, deleteClient, deleteSubMerchant, router, variant])

  useImperativeHandle(ref, () => ({
    submit: () => formRef.current?.submit(),
    resetForm: () => formRef.current?.resetForm(),
    openPrintPreview: () => setOpenCardPreview(true),
    openAssignCardDialog: () => setOpenAssignCardDialog(true),
  }))

  if (initialLoading || !selectedClient) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    )
  }

  if (variant === 'employees') {
    const canShowBalance =
      mode === 'view' && (clientType === ClientType.Client || clientType === ClientType.Merchant)

    return (
      <Stack spacing={3}>
        {canShowBalance && (
          <Box
            sx={{
              alignSelf: 'flex-end',
              marginInlineStart: 'auto',
              width: 'fit-content',
              maxWidth: 360,
            }}
          >
            <ClientBalanceCompact clientId={clientId} />
          </Box>
        )}
        <RegisterForm
          ref={formRef}
          variant={variant}
          mode={mode}
          clientType={clientType}
          client={selectedClient}
          onFormStateChange={handleFormStateChange}
          onSubmit={mode === 'edit' ? handleSubmit : undefined}
        />

        {mode === 'view' && (
          <Box mt={3}>
            <ClientTransactionsDataGrid clientId={clientId} />
          </Box>
        )}

        <CardPreviewDialog
          open={openCardPreview}
          clients={[selectedClient]}
          onClose={() => setOpenCardPreview(false)}
        />

        <AssignNewCardDialog
          open={openAssignCardDialog}
          onClose={() => setOpenAssignCardDialog(false)}
          clientId={selectedClient.id}
          clientName={selectedClient.fullName ?? ''}
        />
      </Stack>
    )
  }

  if (variant === 'users') {
    const effectiveUserRoles = selectedUserRoles.length
      ? selectedUserRoles
      : (selectedClient.roles ?? [])
    const employeeHasChargerRole = effectiveUserRoles.includes(AppRole.Charger)

    return (
      <PageContainer
        title={title}
        mode={mode}
        resource="users"
        roles={roles}
        permissions={USERS_TOPBAR_PERMISSIONS}
        disabledActions={{
          delete: !isCurrentUserAdmin,
          chargeCharger: clientType === ClientType.Employee ? !employeeHasChargerRole : false,
        }}
        clientType={clientType}
        breadcrumbs={[{ label: 'المستخدمون', href: '/ar/users' }, { label: title }]}
        dirty={formState.isDirty}
        loading={formState.isSubmitting}
        onEdit={() => router.push(`/users/${clientId}/edit?type=${usersTypeKey}`)}
        onAttachments={() => setOpenAttachments(true)}
        onDeposit={clientType === ClientType.Admin ? () => setOpenDepositDialog(true) : undefined}
        onChargeCharger={
          clientType === ClientType.Charger || clientType === ClientType.Employee
            ? () => setOpenRefillDialog(true)
            : undefined
        }
        onDelete={isCurrentUserAdmin ? handleDelete : () => undefined}
        onCancel={() => router.back()}
        onSave={() => formRef.current?.submit()}
        onUndo={() => formRef.current?.resetForm()}
      >
        <PageContainer.Grid>
          <PageContainer.Col xs={12}>
            <Stack spacing={3}>
              <Box
                sx={{
                  alignSelf: 'flex-end',
                  marginInlineStart: 'auto',
                  width: 'fit-content',
                  maxWidth: 360,
                }}
              >
                <ClientBalanceCompact clientId={clientId} />
              </Box>

              <RegisterForm
                ref={formRef}
                variant={variant}
                mode={mode}
                clientType={clientType}
                client={selectedClient}
                onFormStateChange={handleFormStateChange}
                onSubmit={mode === 'edit' ? handleSubmit : undefined}
              />

              <AttachmentsManager
                open={openAttachments}
                clientId={clientId}
                clientType={clientType}
                onClose={() => setOpenAttachments(false)}
              />

              {clientType === ClientType.Admin && (
                <DepositDialog
                  open={openDepositDialog}
                  onClose={() => setOpenDepositDialog(false)}
                  clientId={selectedClient.id}
                  clientName={selectedClient.fullName || selectedClient.organizationName || ''}
                />
              )}

              {(clientType === ClientType.Charger || clientType === ClientType.Employee) && (
                <RefillChargerDialog
                  open={openRefillDialog}
                  onClose={() => setOpenRefillDialog(false)}
                  clientId={selectedClient.id}
                  clientName={selectedClient.fullName || selectedClient.organizationName || ''}
                />
              )}

              {mode === 'view' && <ClientTransactionsDataGrid clientId={clientId} />}
            </Stack>
          </PageContainer.Col>
        </PageContainer.Grid>
      </PageContainer>
    )
  }

  if (variant === 'merchants') {
    const canShowBalance = mode === 'view' && clientType === ClientType.Merchant

    return (
      <PageContainer
        title={title}
        mode={mode}
        breadcrumbs={[
          { label: 'نقاط البيع', href: '/merchants' },
          { label: selectedClient.organizationName ?? selectedClient.fullName ?? '' },
        ]}
        dirty={formState.isDirty}
        loading={formState.isSubmitting || deleting}
        onEdit={() => router.push(`/merchants/${clientId}/edit?type=merchant`)}
        onCancel={() => router.push('/merchants')}
        onSave={() => formRef.current?.submit()}
        onUndo={() => formRef.current?.resetForm()}
        onDelete={handleDelete}
      >
        <PageContainer.Grid>
          {canShowBalance && (
            <PageContainer.Col xs={12}>
              <Box sx={{ width: 'fit-content', ml: 'auto' }}>
                <ClientBalanceCompact clientId={clientId} />
              </Box>
            </PageContainer.Col>
          )}

          <PageContainer.Col xs={12}>
            <RegisterForm
              ref={formRef}
              variant={variant}
              mode={mode}
              clientType={clientType}
              client={selectedClient}
              onFormStateChange={handleFormStateChange}
              onSubmit={mode === 'edit' ? handleSubmit : undefined}
            />
          </PageContainer.Col>

          {mode === 'view' && (
            <PageContainer.Col xs={12}>
              <Box mt={1}>
                <ClientTransactionsDataGrid clientId={clientId} />
              </Box>
            </PageContainer.Col>
          )}
        </PageContainer.Grid>
      </PageContainer>
    )
  }

  const canShowBalance =
    mode === 'view' && (clientType === ClientType.Client || clientType === ClientType.Merchant)
  const canShowDebtBalance =
    mode === 'view' && (clientType === ClientType.Client || clientType === ClientType.Partner)
  const canDebtClient =
    mode === 'view' &&
    isCurrentUserAdmin &&
    clientType === ClientType.Client &&
    Boolean(selectedClient.phoneNumber)

  const canPrintAndAssign = clientType === ClientType.Client

  return (
    <PageContainer
      title={title}
      mode={mode}
      resource="clients"
      roles={roles}
      permissions={CLIENTS_TOPBAR_PERMISSIONS}
      breadcrumbs={[
        { label: 'العملاء', href: '/clients' },
        { label: selectedClient.firstName ?? '' },
      ]}
      dirty={formState.isDirty}
      loading={formState.isSubmitting || deleting}
      onEdit={() => router.push(`/clients/${clientId}/edit?type=${clientTypeKey}`)}
      onCancel={() => router.back()}
      onSave={() => formRef.current?.submit()}
      onUndo={() => formRef.current?.resetForm()}
      onDelete={handleDelete}
      onPrint={canPrintAndAssign ? () => setOpenCardPreview(true) : undefined}
      onAttachments={() => setOpenAttachments(true)}
      onAssign={canPrintAndAssign ? () => setOpenAssignCardDialog(true) : undefined}
      onDebt={canDebtClient ? () => setOpenDebtDialog(true) : undefined}
      onCommission={
        clientType === ClientType.Merchant ? () => setOpenCommissionDialog(true) : undefined
      }
    >
      <PageContainer.Grid>
        {(canShowBalance || canShowDebtBalance) && (
          <PageContainer.Col xs={12}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end">
              {canShowBalance ? (
                <ClientBalanceCompact key={`balance-${refreshVersion}`} clientId={clientId} />
              ) : null}
              {canShowDebtBalance ? (
                <ClientDebtBalanceCompact
                  key={`debt-balance-${refreshVersion}`}
                  clientId={clientId}
                />
              ) : null}
            </Stack>
          </PageContainer.Col>
        )}

        <PageContainer.Col xs={12}>
          <RegisterForm
            ref={formRef}
            variant={variant}
            mode={mode}
            clientType={clientType}
            client={selectedClient}
            onFormStateChange={handleFormStateChange}
            onSubmit={mode === 'edit' ? handleSubmit : undefined}
          />
        </PageContainer.Col>

        {mode === 'view' && (
          <PageContainer.Col xs={12}>
            <Box mt={1}>
              <ClientTransactionsDataGrid
                key={`transactions-${refreshVersion}`}
                clientId={clientId}
              />
            </Box>
          </PageContainer.Col>
        )}
      </PageContainer.Grid>

      <AttachmentsManager
        open={openAttachments}
        clientId={clientId}
        clientType={clientType}
        onClose={() => setOpenAttachments(false)}
      />

      <CardPreviewDialog
        open={openCardPreview}
        clients={[selectedClient]}
        onClose={() => setOpenCardPreview(false)}
      />

      <AssignNewCardDialog
        open={openAssignCardDialog}
        onClose={() => setOpenAssignCardDialog(false)}
        clientId={selectedClient.id}
        clientName={selectedClient.fullName ?? ''}
      />

      <CreateCommissionDialog
        open={openCommissionDialog}
        onClose={() => setOpenCommissionDialog(false)}
        clientId={selectedClient.id}
        clientName={selectedClient.organizationName ?? ''}
      />

      <DebtClientDialog
        open={openDebtDialog}
        onClose={() => setOpenDebtDialog(false)}
        onSuccess={() => setRefreshVersion(value => value + 1)}
        clientId={selectedClient.id}
        clientName={selectedClient.fullName || selectedClient.organizationName || ''}
        phoneNumber={selectedClient.phoneNumber ?? ''}
      />
    </PageContainer>
  )
})

export default ClientEditPage
