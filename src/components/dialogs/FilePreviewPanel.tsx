'use client'

import type { Dispatch, SetStateAction } from 'react'
import { useEffect, useRef, useState } from 'react'

import { Alert, Box, CircularProgress, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { RiDeleteBinLine, RiEyeLine, RiFileLine } from 'react-icons/ri'

const isImage = (type?: string | null) => type?.startsWith('image/')
const isPdf = (type?: string | null) => type === 'application/pdf'

export type PreviewItem = {
  id: string
  name: string
  contentType?: string | null
  show: () => Promise<string>
  onDelete?: () => void
}

type Props = {
  items: PreviewItem[]
  emptyText?: string
}

type AttachmentPreviewCardProps = {
  item: PreviewItem
  previewingId: string | null
  previewLoadingId: string | null
  imageUrl?: string
  imageLoading: boolean
  ensureImageUrl: (item: PreviewItem) => Promise<string | undefined>
  openPreviewExternal: (item: PreviewItem) => Promise<void>
  setPreviewingId: Dispatch<SetStateAction<string | null>>
  setPreviewLoadingId: Dispatch<SetStateAction<string | null>>
}

function AttachmentPreviewCard({
  item,
  previewingId,
  previewLoadingId,
  imageUrl,
  imageLoading,
  ensureImageUrl,
  openPreviewExternal,
  setPreviewingId,
  setPreviewLoadingId,
}: AttachmentPreviewCardProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [isInView, setIsInView] = useState(false)
  const image = isImage(item.contentType)
  const pdf = isPdf(item.contentType)
  const isPreviewing = previewingId === item.id

  useEffect(() => {
    const node = containerRef.current

    if (!node || isInView) return

    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(node)

    return () => observer.disconnect()
  }, [isInView])

  useEffect(() => {
    if (!image || !isInView || imageUrl || imageLoading) return

    void ensureImageUrl(item)
  }, [ensureImageUrl, image, imageLoading, imageUrl, isInView, item])

  return (
    <Box
      ref={containerRef}
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
          imageUrl ? (
            <Box
              component="img"
              src={imageUrl}
              alt={item.name}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: isPreviewing ? 'contain' : 'cover',
              }}
            />
          ) : imageLoading ? (
            <CircularProgress size={24} />
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
          <Tooltip title="عرض">
            <span>
              <IconButton size="small" onClick={() => openPreviewExternal(item)}>
                <RiEyeLine size={16} />
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
}

export default function FilePreviewPanel({ items, emptyText = 'لا يوجد مرفقات' }: Props) {
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const [previewLoadingId, setPreviewLoadingId] = useState<string | null>(null)
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({})
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({})
  const requestedImageIdsRef = useRef<Set<string>>(new Set())

  const openPreviewExternal = async (item: PreviewItem) => {
    const url = await item.show()
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const ensureImageUrl = async (item: PreviewItem) => {
    if (imageUrls[item.id]) return imageUrls[item.id]
    if (requestedImageIdsRef.current.has(item.id)) return imageUrls[item.id]

    requestedImageIdsRef.current.add(item.id)
    setLoadingImages(prev => ({ ...prev, [item.id]: true }))

    try {
      const url = await item.show()

      setImageUrls(prev => {
        if (prev[item.id] === url) return prev
        return { ...prev, [item.id]: url }
      })

      return url
    } catch (error) {
      requestedImageIdsRef.current.delete(item.id)
      throw error
    } finally {
      setLoadingImages(prev => {
        if (!prev[item.id]) return prev

        const next = { ...prev }
        delete next[item.id]
        return next
      })
    }
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
        return (
          <AttachmentPreviewCard
            key={item.id}
            item={item}
            previewingId={previewingId}
            previewLoadingId={previewLoadingId}
            imageUrl={imageUrls[item.id]}
            imageLoading={Boolean(loadingImages[item.id])}
            ensureImageUrl={ensureImageUrl}
            openPreviewExternal={openPreviewExternal}
            setPreviewingId={setPreviewingId}
            setPreviewLoadingId={setPreviewLoadingId}
          />
        )
      })}
    </Box>
  )
}
