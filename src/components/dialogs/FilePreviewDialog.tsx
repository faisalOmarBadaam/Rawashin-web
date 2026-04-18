'use client'

import GenericDialog from '@/components/dialogs/GenericDialog'
import { ClientType } from '@/types/api/clients'
import type { PreviewItem } from './FilePreviewPanel';
import FilePreviewPanel from './FilePreviewPanel'

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

type Props = {
  open: boolean
  clientType: ClientType
  items: PreviewItem[]
  onClose: () => void
  title?: string
}

export default function FilePreviewDialog({
  open,
  clientType,
  items,
  onClose,
  title
}: Props) {
  const resolvedTitle =
    title ?? `مرفقات ${getClientTypeLabel(clientType)}`

  return (
    <GenericDialog
      open={open}
      title={resolvedTitle}
      onClose={onClose}
      hideActions
      maxWidth='md'
    >
      <FilePreviewPanel items={items} />
    </GenericDialog>
  )
}
