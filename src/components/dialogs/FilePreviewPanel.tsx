'use client'

import { useEffect, useState } from 'react'

import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { RiDeleteBinLine, RiDownload2Line, RiEyeLine, RiFileLine } from 'react-icons/ri'

import { imageCache } from '@/utils/imageCache'

const isImage = (type?: string | null) => type?.startsWith('image/')
const isPdf = (type?: string | null) => type === 'application/pdf'

export type PreviewItem = {
  id: string
  name: string
  contentType?: string | null
  download: () => Promise<Blob>
  onDelete?: () => void
}

type Props = {
  items: PreviewItem[]
  emptyText?: string
}

type ImageState = {
  url: string | null
  loading: boolean
}

export default function FilePreviewPanel({ items, emptyText = 'لا يوجد مرفقات' }: Props) {
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null)
  const [images, setImages] = useState<Record<string, ImageState>>({})

  /* preload thumbnails with cache */
  useEffect(() => {
    let active = true

    const load = async () => {
      for (const item of items) {
        if (!isImage(item.contentType)) continue
        if (images[item.id]) continue

        const cached = imageCache.get(item.id)
        if (cached) {
          imageCache.retain(item.id)
          setImages(prev => ({
            ...prev,
            [item.id]: { url: cached.url, loading: false },
          }))
          continue
        }

        setImages(prev => ({
          ...prev,
          [item.id]: { url: null, loading: true },
        }))

        try {
          const blob = await item.download()
          if (!active) return

          const url = URL.createObjectURL(blob)
          imageCache.set(item.id, url)

          setImages(prev => ({
            ...prev,
            [item.id]: { url, loading: false },
          }))
        } catch {
          setImages(prev => ({
            ...prev,
            [item.id]: { url: null, loading: false },
          }))
        }
      }
    }

    load()

    return () => {
      active = false
      Object.keys(images).forEach(id => imageCache.release(id))
    }
  }, [items])

  const openPreviewExternal = async (item: PreviewItem) => {
    const blob = await item.download()
    const url = URL.createObjectURL(blob)
    window.open(url, '_blank', 'noopener,noreferrer')
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  }

  const downloadFile = async (item: PreviewItem) => {
    const blob = await item.download()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = item.name
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!items.length) {
    return <Alert severity="info">{emptyText}</Alert>
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 1.5,
        gridTemplateColumns: { xs: 'repeat(2,1fr)', sm: 'repeat(3,1fr)' },
      }}
    >
      {items.map(item => {
        const image = isImage(item.contentType)
        const pdf = isPdf(item.contentType)
        const imageState = images[item.id]
        const isPreviewing = previewingId === item.id

        return (
          <Box
            key={item.id}
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
              gridColumn: isPreviewing ? 'span 2' : 'span 1',
            }}
          >
            <Box
              sx={{
                width: '100%',
                aspectRatio: isPreviewing ? '16 / 9' : '1 / 1',
                display: 'grid',
                placeItems: 'center',
                bgcolor: 'action.hover',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {previewLoadingId === item.id && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'rgba(255,255,255,0.6)',
                    zIndex: 2,
                  }}
                >
                  <CircularProgress />
                </Box>
              )}

              {image ? (
                imageState?.loading ? (
                  <Skeleton variant="rectangular" width="100%" height="100%" />
                ) : imageState?.url ? (
                  <Box
                    component="img"
                    src={imageState.url}
                    alt={item.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: isPreviewing ? 'contain' : 'cover',
                    }}
                  />
                ) : (
                  <RiFileLine size={36} />
                )
              ) : (
                <RiFileLine size={36} />
              )}
            </Box>

            <Box sx={{ p: 1 }}>
              <Typography variant="body2" fontWeight={600} noWrap>
                {item.name}
              </Typography>

              <Stack direction="row" spacing={0.5} mt={1}>
                {(image || pdf) && (
                  <Tooltip title="معاينة">
                    <span>
                      <IconButton
                        size="small"
                        onClick={async () => {
                          if (!image) return openPreviewExternal(item)

                          if (previewingId === item.id) {
                            setPreviewingId(null)
                            return
                          }

                          setPreviewLoadingId(item.id)
                          setPreviewingId(item.id)
                          setPreviewLoadingId(null)
                        }}
                      >
                        <RiEyeLine size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}

                <Tooltip title="تحميل">
                  <span>
                    <IconButton size="small" onClick={() => downloadFile(item)}>
                      <RiDownload2Line size={16} />
                    </IconButton>
                  </span>
                </Tooltip>

                {item.onDelete && (
                  <Tooltip title="حذف">
                    <span>
                      <IconButton size="small" color="error" onClick={item.onDelete}>
                        <RiDeleteBinLine size={16} />
                      </IconButton>
                    </span>
                  </Tooltip>
                )}
              </Stack>
            </Box>
          </Box>
        )
      })}
    </Box>
  )
}
