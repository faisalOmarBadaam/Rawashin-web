'use client'

import { useState } from 'react'

import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
  Typography
} from '@mui/material'
import {
  RiDownload2Line,
  RiEyeLine,
  RiFileLine,
  RiImage2Line
} from 'react-icons/ri'

import GenericDialog from '@/components/dialogs/GenericDialog'
import { ClientType } from '@/types/api/clients'

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

const isImage = (type?: string | null) => type?.startsWith('image/')
const isPdf = (type?: string | null) => type === 'application/pdf'

export type PreviewItem = {
  id: string
  name: string
  contentType?: string | null
  download: () => Promise<Blob>
}

type Props = {
  open: boolean
  clientType: ClientType
  items: PreviewItem[]
  onClose: () => void
  title?: string
  emptyText?: string
}

export default function FilePreviewDialog({
  open,
  clientType,
  items,
  onClose,
  title,
  emptyText = 'لا يوجد مرفقات'
}: Props) {
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const resolvedTitle =
    title ?? `مرفقات ${getClientTypeLabel(clientType)}`

  const openPreview = async (item: PreviewItem) => {
    try {
      setLoadingId(item.id)
      const blob = await item.download()
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener,noreferrer')
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } finally {
      setLoadingId(null)
    }
  }

  const downloadFile = async (item: PreviewItem) => {
    try {
      setLoadingId(item.id)
      const blob = await item.download()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = item.name
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <GenericDialog
      open={open}
      title={resolvedTitle}
      onClose={onClose}
      hideActions
      maxWidth='md'
    >
      <Stack spacing={2} dir='rtl'>
        {!items.length && (
          <Alert severity='info'>{emptyText}</Alert>
        )}

        {!!items.length && (
          <Box
            sx={{
              display: 'grid',
              gap: 1.5,
              gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)' }
            }}
          >
            {items.map(item => {
              const loading = loadingId === item.id
              const image = isImage(item.contentType)
              const pdf = isPdf(item.contentType)

              return (
                <Box
                  key={item.id}
                  sx={theme => ({
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    overflow: 'hidden'
                  })}
                >
                  <Box
                    sx={theme => ({
                      height: 120,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: theme.palette.action.hover
                    })}
                  >
                    {image ? (
                      <RiImage2Line size={36} />
                    ) : (
                      <RiFileLine size={36} />
                    )}
                  </Box>

                  <Box sx={{ p: 1 }}>
                    <Typography
                      variant='body2'
                      fontWeight={600}
                      noWrap
                      title={item.name}
                    >
                      {item.name}
                    </Typography>

                    <Stack direction='row' spacing={0.5} mt={1}>
                      {(image || pdf) && (
                        <Tooltip title='معاينة'>
                          <span>
                            <IconButton
                              size='small'
                              onClick={() => openPreview(item)}
                              disabled={loading}
                            >
                              {loading ? (
                                <CircularProgress size={16} />
                              ) : (
                                <RiEyeLine size={16} />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
                      )}

                      <Tooltip title='تحميل'>
                        <span>
                          <IconButton
                            size='small'
                            onClick={() => downloadFile(item)}
                            disabled={loading}
                          >
                            <RiDownload2Line size={16} />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Stack>
                  </Box>
                </Box>
              )
            })}
          </Box>
        )}
      </Stack>
    </GenericDialog>
  )
}
