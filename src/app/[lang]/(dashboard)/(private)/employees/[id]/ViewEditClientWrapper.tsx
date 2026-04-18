'use client'

import { useMemo, useRef, useState } from 'react'

import { useRouter } from 'next/navigation'

import { Box } from '@mui/material'

import { useAuthStore } from '@/contexts/auth/auth.store'
import type { SmartActionPermissionMap } from '@/core/topbar/smart-topbar.types'
import AttachmentsManager from '@/domains/clients/components/shared/attachments/AttachmentsManager'
import ClientEditPage, { type ViewEditClientRef } from '@/domains/clients/pages/ClientEditPage'
import PageContainer from '@/layout/PageContainer'
import { ClientType } from '@/types/api/clients'

type Props = {
  id: string
  clientType: ClientType
  mode: 'view' | 'edit'
  title: string
}

const EMPTY_ROLES: string[] = []

const TITLES = {
  view: {
    [ClientType.Client]: 'عرض بيانات المستفيد',
    [ClientType.Merchant]: 'عرض بيانات نقطة البيع',
    [ClientType.Partner]: 'عرض بيانات الشريك',
  },
  edit: {
    [ClientType.Client]: 'تعديل بيانات المستفيد',
    [ClientType.Merchant]: 'تعديل بيانات نقطة البيع',
    [ClientType.Partner]: 'تعديل بيانات الشريك',
  },
}

const EMPLOYEE_TOPBAR_PERMISSIONS: SmartActionPermissionMap = {
  attachments: 'update',
  print: 'update',
}

export default function ViewEditClientWrapper({ id, clientType, mode, title }: Props) {
  const router = useRouter()
  const roles = useAuthStore(state => state.session?.roles ?? EMPTY_ROLES)
  const viewEditRef = useRef<ViewEditClientRef>(null)
  const [openAttachments, setOpenAttachments] = useState(false)
  const [formDirty, setFormDirty] = useState(false)
  const [formSubmitting, setFormSubmitting] = useState(false)

  const typeKey = useMemo(() => {
    if (clientType === ClientType.Merchant) return 'merchant'
    if (clientType === ClientType.Partner) return 'partner'
    return 'client'
  }, [clientType])

  const goToView = () => router.push(`/employees/${id}?type=${typeKey}&mode=view`)

  return (
    <PageContainer
      title={title}
      mode={mode}
      resource="clients"
      roles={roles}
      clientType={clientType}
      permissions={EMPLOYEE_TOPBAR_PERMISSIONS}
      breadcrumbs={[{ label: 'العملاء', href: '/ar/employees' }, { label: title }]}
      dirty={mode === 'edit' ? formDirty : undefined}
      loading={mode === 'edit' ? formSubmitting : false}
      onAdd={() => router.push(`/employees/add?type=${typeKey}`)}
      onAttachments={() => setOpenAttachments(true)}
      onPrint={() => viewEditRef.current?.openPrintPreview()}
      onAssign={() => viewEditRef.current?.openAssignCardDialog()}
      onEdit={() => router.push(`/employees/${id}/edit?type=${typeKey}`)}
      onSave={mode === 'edit' ? () => viewEditRef.current?.submit() : undefined}
      onUndo={mode === 'edit' ? () => viewEditRef.current?.resetForm() : goToView}
      onCancel={goToView}
    >
      <Box
        sx={{
          width: '100%',
          marginTop: '10px',
        }}
      >
        <ClientEditPage
          ref={viewEditRef}
          variant="employees"
          clientId={id}
          clientType={clientType}
          title={title}
          mode={mode}
          onFormStateChange={({ isDirty, isSubmitting }) => {
            setFormDirty(isDirty)
            setFormSubmitting(isSubmitting)
          }}
        />

        <AttachmentsManager
          open={openAttachments}
          clientId={id}
          clientType={clientType}
          onClose={() => setOpenAttachments(false)}
        />
      </Box>
    </PageContainer>
  )
}
