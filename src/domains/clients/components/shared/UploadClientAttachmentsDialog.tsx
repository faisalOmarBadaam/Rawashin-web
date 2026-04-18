'use client'

import type { ReactNode } from 'react'

import { toast } from 'react-toastify'

import FileUploadDialog from '@/components/dialogs/FileUploadDialog'
import { useAddClientAttachmentMutation } from '@/libs/react-query/attachments'
import type { AddClientAttachmentResultDto } from '@/types/api/attachments'
import { ClientType } from '@/types/api/clients'

export type UploadClientAttachmentsDialogProps = {
  open: boolean
  clientId: string
  clientType: ClientType
  onClose: () => void
  onSuccess?: (result: AddClientAttachmentResultDto[]) => void
  title?: string
  description?: ReactNode
  helperText?: ReactNode

  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSizeBytes?: number

  formFieldName?: string
  fields?: Record<string, string | number | boolean | undefined | null>
}


const UploadClientAttachmentsDialog = ({
  open,
  clientId,
  clientType,
  onClose,
  onSuccess,
  title,
  description,
  helperText,
  accept,
  multiple = true,
  maxFiles,
  maxSizeBytes,
  formFieldName = 'files',
  fields
}: UploadClientAttachmentsDialogProps) => {

  const addMutation = useAddClientAttachmentMutation(clientId)

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

const resolvedTitle =
  title ?? `رفع مرفقات ${getClientTypeLabel(clientType)}`

  const upload = async (files: File[]) => {
    if (!clientId) throw new Error('clientId غير موجود')

    const result = await addMutation.mutateAsync({
      files,
      options: { formFieldName, fields }
    })

    toast.success(`تم رفع ${result.length} ملف`, { autoClose: 3000 })
    onSuccess?.(result)
    onClose()
  }

  return (
    <FileUploadDialog
      open={open}
       title={resolvedTitle}
      onClose={onClose}
      onUpload={upload}
      submitText='رفع'
      accept={accept}
      multiple={multiple}
      maxFiles={maxFiles}
      maxSizeBytes={maxSizeBytes}
      description={description}
      helperText={helperText ?? 'يمكنك سحب الملفات وإفلاتها أو اختيارها، ثم اضغط رفع لإتمام العملية.'}
      submitDisabled={!clientId || addMutation.isPending}
    />
  )
}

export default UploadClientAttachmentsDialog
