'use client'

import { useMemo, useState } from 'react'

import { Icon } from '@iconify/react'
import { Box, Button, CircularProgress, Stack, Tab, Tabs } from '@mui/material'
import { toast } from 'react-toastify'

import AlertDialog from '@/components/dialogs/AlertDialog'
import GenericDialog from '@/components/dialogs/GenericDialog'
import { getErrorMessage } from '@/libs/api/getErrorMessage'
import { AttachmentsApi } from '@/libs/api/modules'
import {
  useClientAttachmentsQuery,
  useDeleteAttachmentMutation,
} from '@/libs/react-query/attachments'
import { ClientType } from '@/types/api/clients'

import FilePreviewPanel, { type PreviewItem } from '@/components/dialogs/FilePreviewPanel'
import UploadClientAttachmentsDialog from '../UploadClientAttachmentsDialog'

type Props = {
  open: boolean
  clientId: string
  clientType: ClientType
  onClose: () => void
}

const getClientTypeLabel = (type: ClientType) => {
  switch (type) {
    case ClientType.Client:
      return 'المستفيد'
    case ClientType.Merchant:
      return 'نقطة البيع'
    case ClientType.Partner:
      return 'الشريك'
    default:
      return 'العميل'
  }
}

export default function AttachmentsManager({ open, clientId, clientType, onClose }: Props) {
  const [tab, setTab] = useState<'preview' | 'upload'>('preview')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null)

  const attachmentsQuery = useClientAttachmentsQuery(clientId, {
    enabled: open && Boolean(clientId),
  })
  const deleteAttachmentMutation = useDeleteAttachmentMutation(clientId)

  const title = `مرفقات ${getClientTypeLabel(clientType)}`

  const previewItems: PreviewItem[] = useMemo(
    () =>
      (attachmentsQuery.data ?? []).map(a => ({
        id: a.id,
        name: a.originalFileName ?? '',
        contentType: a.contentType,
        download: () => AttachmentsApi.downloadById(a.id),
        onDelete: () => setDeleteTarget({ id: a.id, name: a.originalFileName ?? '' }),
      })),
    [attachmentsQuery.data],
  )

  const refresh = async () => {
    await attachmentsQuery.refetch()
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return

    try {
      await deleteAttachmentMutation.mutateAsync(deleteTarget.id)
      toast.success('تم حذف المرفق بنجاح')
      setDeleteTarget(null)
    } catch (error) {
      toast.error(getErrorMessage(error, 'تعذر حذف المرفق'))
    }
  }

  return (
    <>
      <GenericDialog
        open={open}
        title={title}
        onClose={onClose}
        maxWidth="md"
        hideActions
        extraActions={
          <Button
            startIcon={<Icon icon="mdi:refresh" />}
            onClick={refresh}
            disabled={attachmentsQuery.isFetching}
          >
            تحديث
          </Button>
        }
      >
        <Tabs value={tab} onChange={(_, v) => setTab(v)}>
          <Tab value="preview" label="المرفقات" />
          <Tab value="upload" label="رفع ملفات" />
        </Tabs>

        {tab === 'preview' && (
          <Stack spacing={2} mt={2}>
            {attachmentsQuery.isLoading ? (
              <CircularProgress />
            ) : (
              <FilePreviewPanel items={previewItems} />
            )}
          </Stack>
        )}

        {tab === 'upload' && (
          <Box display="flex" justifyContent="flex-end" mt={2}>
            <Button
              variant="contained"
              startIcon={<Icon icon="mdi:upload" />}
              onClick={() => setUploadOpen(true)}
            >
              رفع المرفقات
            </Button>
          </Box>
        )}
      </GenericDialog>

      <UploadClientAttachmentsDialog
        open={uploadOpen}
        clientId={clientId}
        clientType={clientType}
        onClose={() => setUploadOpen(false)}
        onSuccess={async () => {
          await refresh()
          setUploadOpen(false)
          setTab('preview')
        }}
        accept=".pdf,image/*"
        maxFiles={10}
      />

      <AlertDialog
        open={Boolean(deleteTarget)}
        title="حذف مرفق"
        sx={{ zIndex: theme => theme.zIndex.modal + 2 }}
        description={
          <>
            هل أنت متأكد من حذف:
            <strong> {deleteTarget?.name}</strong>؟
          </>
        }
        confirmText="حذف"
        cancelText="إلغاء"
        loading={deleteAttachmentMutation.isPending}
        onClose={() => !deleteAttachmentMutation.isPending && setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  )
}
