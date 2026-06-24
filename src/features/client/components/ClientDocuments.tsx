import { useState } from 'react'
import dayjs from 'dayjs'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import { toast } from 'sonner'

import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined'
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined'
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import type { ClientAttachment } from '../types'
import {
  useAttachmentTemporaryUrl,
  useDeleteClientAttachment,
  useGetClientAttachments,
  useUploadClientAttachment,
} from '../hooks'
import { getAttachmentTemporaryUrl } from '../api'

interface ClientDocumentsProps {
  clientId: string
}

function isImage(attachment: ClientAttachment) {
  if (attachment.contentType?.startsWith('image/')) {
    return true
  }

  return /\.(jpg|jpeg|png|webp|gif)$/i.test(
    attachment.originalFileName,
  )
}

function isPdf(attachment: ClientAttachment) {
  if (attachment.contentType === 'application/pdf') {
    return true
  }

  return /\.pdf$/i.test(attachment.originalFileName)
}

function AttachmentPreview({
  attachment,
}: {
  attachment: ClientAttachment
}) {
  const attachmentIsImage = isImage(attachment)

  const temporaryUrlQuery = useAttachmentTemporaryUrl(
    attachment.id
  )

  if (!attachmentIsImage) {
    return (
      <Box
        sx={{
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        {isPdf(attachment) ? (
          <PictureAsPdfOutlinedIcon
            color="error"
            sx={{ fontSize: 70 }}
          />
        ) : (
          <DescriptionOutlinedIcon
            color="disabled"
            sx={{ fontSize: 70 }}
          />
        )}
      </Box>
    )
  }

  if (temporaryUrlQuery.isLoading) {
    return (
      <Box
        sx={{
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
        }}
      >
        <CircularProgress size={30} />
      </Box>
    )
  }

  if (
    temporaryUrlQuery.isError ||
    !temporaryUrlQuery.data
  ) {
    return (
      <Box
        sx={{
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'grey.100',
        }}
      >
        <ImageNotSupportedOutlinedIcon
          color="disabled"
          sx={{ fontSize: 60 }}
        />
      </Box>
    )
  }

  return (
    <Box
      component="img"
      src={temporaryUrlQuery.data.url}
      alt={attachment.originalFileName}
      loading="lazy"
      sx={{
        display: 'block',
        width: '100%',
        height: 200,
        objectFit: 'contain',
        bgcolor: 'grey.100',
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    />
  )
}

export default function ClientDocuments({
  clientId,
}: ClientDocumentsProps) {
  const attachmentsQuery = useGetClientAttachments(clientId)
  const uploadAttachmentMutation =
    useUploadClientAttachment()
  const deleteAttachmentMutation =
    useDeleteClientAttachment()

  const [openingAttachmentId, setOpeningAttachmentId] =
    useState<string | null>(null)
  const [deletingAttachmentId, setDeletingAttachmentId] =
    useState<string | null>(null)

  const handleAttachmentChange = async (
  event: React.ChangeEvent<HTMLInputElement>,
) => {
  const input = event.currentTarget

  const selectedFiles = Array.from(input.files ?? [])

  input.value = ''

  if (selectedFiles.length === 0) {
    return
  }

  try {
    await uploadAttachmentMutation.mutateAsync({
      clientId,
      files: selectedFiles,
    })

    toast.success('تم رفع المستندات بنجاح')
  } catch (error) {
    console.error('Upload attachments error:', error)

    toast.error(
      error instanceof Error
        ? error.message
        : 'تعذر رفع المستندات',
    )
  }
}
  const handleDeleteAttachment = async (
    attachment: ClientAttachment,
  ) => {
    const confirmed = window.confirm(
      `هل تريد حذف المستند "${attachment.originalFileName}"؟`,
    )

    if (!confirmed) {
      return
    }

      setDeletingAttachmentId(attachment.id)

      await deleteAttachmentMutation.mutateAsync({
        clientId,
        attachmentId: attachment.id,
      })
      toast.success('تم حذف المستند بنجاح')
    }

  const handleOpenAttachment = async (
    attachmentId: string,
  ) => {
    const documentWindow = window.open('about:blank', '_blank')

    try {
      setOpeningAttachmentId(attachmentId)

      const temporaryUrlResponse =
        await getAttachmentTemporaryUrl(attachmentId)

      if (documentWindow) {
        documentWindow.opener = null
        documentWindow.location.replace(temporaryUrlResponse.url)
      } else {
        window.location.href = temporaryUrlResponse.url
      }
    } catch (error) {
      documentWindow?.close()

      console.error(error)
      alert(
        error instanceof Error
          ? error.message
          : 'تعذر فتح المستند',
      )
    } finally {
      setOpeningAttachmentId(null)
    }
  }

  const renderContent = () => {
    if (attachmentsQuery.isLoading) {
      return (
        <Box
          sx={{
            minHeight: 250,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress />
        </Box>
      )
    }

    if (attachmentsQuery.isError) {
      const message =
        attachmentsQuery.error instanceof Error
          ? attachmentsQuery.error.message
          : 'تعذر جلب مستندات المستفيد'

      return <Alert severity="error">{message}</Alert>
    }

    if (attachmentsQuery.data?.totalCount === 0) {
      return (
        <Alert severity="info">
          لا توجد مستندات لهذا المستفيد.
        </Alert>
      )
    }

    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(3, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {attachmentsQuery.data?.items.map((attachment) => {
          const isOpening =
            openingAttachmentId === attachment.id
          const isDeleting =
            deletingAttachmentId === attachment.id

          return (
            <Card
              key={attachment.id}
              variant="outlined"
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <AttachmentPreview attachment={attachment} />

              <CardContent
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 800,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {attachment.originalFileName}
                  </Typography>

                  <Chip
                    size="small"
                    variant="outlined"
                    label={
                      isImage(attachment)
                        ? 'صورة'
                        : isPdf(attachment)
                          ? 'PDF'
                          : 'ملف'
                    }
                    color={
                      isPdf(attachment)
                        ? 'error'
                        : isImage(attachment)
                          ? 'primary'
                          : 'default'
                    }
                  />
                </Box>

                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  تاريخ الرفع:{' '}
                  {dayjs(attachment.createdAt).format(
                    'YYYY/MM/DD HH:mm',
                  )}
                </Typography>

                <Box
                  sx={{
                    mt: 'auto',
                    display: 'flex',
                    gap: 1,
                    alignItems: 'stretch',
                  }}
                >
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={
                      isOpening ? (
                        <CircularProgress
                          size={18}
                          color="inherit"
                        />
                      ) : (
                        <VisibilityOutlinedIcon />
                      )
                    }
                    disabled={isOpening || isDeleting}
                    onClick={() =>
                      handleOpenAttachment(attachment.id)
                    }
                  >
                    {isOpening
                      ? 'جاري فتح المستند...'
                      : 'عرض المستند'}
                  </Button>

                  <IconButton
                    color="error"
                    disabled={isDeleting || isOpening}
                    onClick={() =>
                      handleDeleteAttachment(attachment)
                    }
                    sx={{
                      border: '1px solid',
                      borderColor: 'error.main',
                      borderRadius: 2,
                    }}
                  >
                    {isDeleting ? (
                      <CircularProgress
                        size={18}
                        color="error"
                      />
                    ) : (
                      <DeleteOutlineOutlinedIcon />
                    )}
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          )
        })}
      </Box>
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
        }}
      >
        <Button
          component="label"
          variant="contained"
          startIcon={
            uploadAttachmentMutation.isPending ? (
              <CircularProgress
                size={18}
                color="inherit"
              />
            ) : (
              <UploadFileOutlinedIcon />
            )
          }
          disabled={uploadAttachmentMutation.isPending}
        >
          {uploadAttachmentMutation.isPending
            ? 'جاري رفع المستند...'
            : 'إضافة مستند'}
          <input
            hidden
            type="file"
            multiple
            onChange={handleAttachmentChange}
          />
        </Button>
      </Box>

      {renderContent()}
    </Box>
  )
}