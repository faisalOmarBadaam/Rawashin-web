'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Tooltip,
  Typography
} from '@mui/material'
import { RiDeleteBinLine, RiFileLine, RiUploadCloud2Line } from 'react-icons/ri'

import GenericDialog from '@/components/dialogs/GenericDialog'

export type FileUploadDialogProps = {
  open: boolean
  title: string
  description?: ReactNode
  helperText?: ReactNode
  accept?: string
  multiple?: boolean
  maxFiles?: number
  maxSizeBytes?: number
  initialFiles?: File[]
  showPreview?: boolean
  submitText?: string
  cancelText?: string
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  disablePortal?: boolean
  submitDisabled?: boolean
  preserveOnClose?: boolean
  onClose: () => void
  onUpload: (files: File[]) => Promise<void> | void
}

const formatBytes = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const idx = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1)
  const num = value / 1024 ** idx
  const digits = idx === 0 ? 0 : num < 10 ? 2 : 1

  return `${num.toFixed(digits)} ${units[idx]}`
}

const sameFile = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified

const fileKey = (f: File) => `${f.name}-${f.size}-${f.lastModified}`

const isProbablyImage = (f: File) => {
  if (f.type?.startsWith('image/')) return true
  const name = f.name?.toLowerCase?.() ?? ''
  return ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp', '.svg'].some(ext => name.endsWith(ext))
}

const isProbablyPdf = (f: File) => {
  if (f.type === 'application/pdf') return true
  const name = f.name?.toLowerCase?.() ?? ''
  return name.endsWith('.pdf')
}

const FileUploadDialog = ({
  open,
  title,
  description,
  helperText,
  accept,
  multiple = true,
  maxFiles,
  maxSizeBytes,
  initialFiles,
  showPreview = true,
  submitText = 'رفع',
  cancelText = 'إلغاء',
  maxWidth = 'sm',
  fullWidth = true,
  disablePortal = false,
  submitDisabled = false,
  preserveOnClose = false,
  onClose,
  onUpload
}: FileUploadDialogProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null)
  const objectUrlsRef = useRef<Map<string, string>>(new Map())

  const [files, setFiles] = useState<File[]>(() => initialFiles ?? [])
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const previewItems = useMemo(() => {
    if (!showPreview) return [] as { key: string; file: File; url?: string; kind: 'image' | 'pdf' | 'other' }[]

    const nextKeys = new Set(files.map(fileKey))

    for (const [key, url] of objectUrlsRef.current.entries()) {
      if (!nextKeys.has(key)) {
        URL.revokeObjectURL(url)
        objectUrlsRef.current.delete(key)
      }
    }

    return files.map(f => {
      const key = fileKey(f)

      if (isProbablyImage(f) || isProbablyPdf(f)) {
        let url = objectUrlsRef.current.get(key)
        if (!url) {
          url = URL.createObjectURL(f)
          objectUrlsRef.current.set(key, url)
        }

        return { key, file: f, url, kind: isProbablyImage(f) ? 'image' : 'pdf' }
      }

      return { key, file: f, kind: 'other' as const }
    })
  }, [files, showPreview])

  useEffect(() => {
    if (!open && !preserveOnClose) {
      for (const url of objectUrlsRef.current.values()) {
        URL.revokeObjectURL(url)
      }
      objectUrlsRef.current.clear()
    }
  }, [open, preserveOnClose])

  useEffect(() => {
    if (!open && !preserveOnClose) {
      setFiles(initialFiles ?? [])
      setError(null)
      setDragActive(false)
      setUploading(false)
    }
  }, [open, preserveOnClose, initialFiles])

  const totalSize = useMemo(() => files.reduce((acc, f) => acc + (f.size || 0), 0), [files])

  const canSubmit = useMemo(() => {
    if (submitDisabled) return false
    if (uploading) return false
    return files.length > 0
  }, [submitDisabled, uploading, files.length])

  const validateAndAddFiles = (incoming: File[]) => {
    setError(null)

    const picked = multiple ? incoming : incoming.slice(0, 1)
    const next: File[] = []
    const messages: string[] = []

    for (const f of picked) {
      if (maxSizeBytes && f.size > maxSizeBytes) {
        messages.push(`الملف "${f.name}" يتجاوز الحد الأقصى للحجم (${formatBytes(maxSizeBytes)})`)
        continue
      }

      const isDuplicate = files.some(existing => sameFile(existing, f)) || next.some(existing => sameFile(existing, f))

      if (isDuplicate) continue
      next.push(f)
    }

    let combined = [...files, ...next]

    if (typeof maxFiles === 'number' && maxFiles > 0 && combined.length > maxFiles) {
      combined = combined.slice(0, maxFiles)
      messages.push(`الحد الأقصى للملفات هو ${maxFiles}`)
    }

    if (messages.length) setError(messages[0])
    setFiles(combined)

    if (inputRef.current) inputRef.current.value = ''
  }

  const onPick = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    validateAndAddFiles(Array.from(fileList))
  }

  const onDropFiles = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const dropped = Array.from(e.dataTransfer.files || [])
    if (dropped.length) validateAndAddFiles(dropped)
  }

  const removeAt = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx))
  }

  const clearAll = () => setFiles([])

  const triggerPicker = () => inputRef.current?.click()

  const submit = async () => {
    try {
      setUploading(true)
      setError(null)
      await onUpload(files)
    } catch (e: any) {
      const msg = e?.message ?? 'فشل رفع الملفات'
      setError(msg)
    } finally {
      setUploading(false)
    }
  }

  return (
    <GenericDialog
      open={open}
      title={title}
      onClose={onClose}
      onSubmit={submit}
      submitText={submitText}
      cancelText={cancelText}
      loading={uploading}
      submitDisabled={!canSubmit}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disablePortal={disablePortal}
      extraActions={
        files.length ? (
          <Button onClick={clearAll} color='inherit' disabled={uploading}>
            مسح الكل
          </Button>
        ) : null
      }
    >
      <Stack spacing={2} dir='rtl'>
        {description ? <Typography variant='body2'>{description}</Typography> : null}

        <Box
          onClick={triggerPicker}
          onDragEnter={e => {
            e.preventDefault()
            e.stopPropagation()
            setDragActive(true)
          }}
          onDragOver={e => {
            e.preventDefault()
            e.stopPropagation()
            setDragActive(true)
          }}
          onDragLeave={e => {
            e.preventDefault()
            e.stopPropagation()
            setDragActive(false)
          }}
          onDrop={onDropFiles}
          sx={theme => ({
            cursor: 'pointer',
            border: '1.5px dashed',
            borderColor: dragActive ? theme.palette.primary.main : theme.palette.divider,
            borderRadius: 2,
            p: 2,
            bgcolor: dragActive ? theme.palette.action.hover : 'transparent',
            transition: 'background-color 120ms ease, border-color 120ms ease'
          })}
          role='button'
          tabIndex={0}
          aria-label='رفع ملفات'
        >
          <Stack direction='row' spacing={2} alignItems='center'>
            <Box
              sx={theme => ({
                width: 42,
                height: 42,
                display: 'grid',
                placeItems: 'center',
                borderRadius: 2,
                bgcolor: theme.palette.action.hover
              })}
            >
              <RiUploadCloud2Line size={22} />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography fontWeight={700}>اسحب الملفات هنا أو اضغط للاختيار</Typography>
              <Typography variant='body2' color='text.secondary'>
                {multiple ? 'يمكنك اختيار أكثر من ملف' : 'ملف واحد فقط'}
                {maxFiles ? ` • الحد الأقصى: ${maxFiles}` : ''}
                {maxSizeBytes ? ` • أقصى حجم للملف: ${formatBytes(maxSizeBytes)}` : ''}
              </Typography>
            </Box>

            <Button
              variant='outlined'
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                triggerPicker()
              }}
              disabled={uploading}
            >
              اختيار ملفات
            </Button>
          </Stack>

          <input
            ref={inputRef}
            hidden
            type='file'
            accept={accept}
            multiple={multiple}
            onChange={e => onPick(e.target.files)}
          />
        </Box>

        {helperText ? <Alert severity='info'>{helperText}</Alert> : null}
        {error ? <Alert severity='error'>{error}</Alert> : null}

        {!!files.length && (
          <>
            <Divider />

            {showPreview && (
              <>
                <Stack direction='row' justifyContent='space-between' alignItems='center'>
                  <Typography fontWeight={700}>المعاينة</Typography>
                  <Typography variant='body2' color='text.secondary'>
                    اضغط على الملف لفتحه
                  </Typography>
                </Stack>

                <Box
                  sx={{
                    display: 'grid',
                    gap: 1.5,
                    gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }
                  }}
                >
                  {previewItems.map(item => {
                    const idx = files.findIndex(f => fileKey(f) === item.key)
                    const openPreview = () => {
                      if (!item.url) return
                      window.open(item.url, '_blank', 'noopener,noreferrer')
                    }

                    return (
                      <Box
                        key={item.key}
                        onClick={item.url ? openPreview : undefined}
                        sx={theme => ({
                          position: 'relative',
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 2,
                          overflow: 'hidden',
                          cursor: item.url ? 'pointer' : 'default'
                        })}
                      >
                        {item.kind === 'image' ? (
                          <Box
                            component='img'
                            src={item.url}
                            alt={item.file.name}
                            sx={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
                          />
                        ) : (
                          <Box
                            sx={theme => ({
                              height: 120,
                              display: 'grid',
                              placeItems: 'center',
                              bgcolor: theme.palette.action.hover
                            })}
                          >
                            <Stack spacing={0.5} alignItems='center'>
                              <RiFileLine size={24} />
                              <Typography variant='body2' color='text.secondary'>
                                {item.kind === 'pdf' ? 'PDF' : 'ملف'}
                              </Typography>
                            </Stack>
                          </Box>
                        )}

                        <Box sx={{ p: 1 }}>
                          <Typography variant='body2' fontWeight={600} noWrap title={item.file.name}>
                            {item.file.name}
                          </Typography>
                          <Typography variant='caption' color='text.secondary' noWrap>
                            {formatBytes(item.file.size)}
                          </Typography>
                        </Box>

                        <Tooltip title='إزالة'>
                          <span>
                            <IconButton
                              size='small'
                              onClick={e => {
                                e.preventDefault()
                                e.stopPropagation()
                                if (idx >= 0) removeAt(idx)
                              }}
                              disabled={uploading}
                              sx={theme => ({
                                position: 'absolute',
                                top: 6,
                                left: 6,
                                bgcolor: theme.palette.background.paper,
                                border: `1px solid ${theme.palette.divider}`,
                                '&:hover': { bgcolor: theme.palette.background.paper }
                              })}
                              aria-label='إزالة الملف'
                            >
                              <RiDeleteBinLine size={16} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    )
                  })}
                </Box>

                <Divider />
              </>
            )}

            <Stack direction='row' justifyContent='space-between' alignItems='center'>
              <Typography fontWeight={700}>الملفات المختارة</Typography>
              <Typography variant='body2' color='text.secondary'>
                {files.length} ملف • {formatBytes(totalSize)}
              </Typography>
            </Stack>

            <List dense disablePadding>
              {files.map((f, idx) => (
                <ListItem
                  key={fileKey(f)}
                  disableGutters
                  secondaryAction={
                    <Tooltip title='إزالة'>
                      <span>
                        <IconButton edge='end' onClick={() => removeAt(idx)} disabled={uploading}>
                          <RiDeleteBinLine size={18} />
                        </IconButton>
                      </span>
                    </Tooltip>
                  }
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
                    <RiFileLine size={18} />
                  </Box>
                  <ListItemText primary={f.name} secondary={`${formatBytes(f.size)}${f.type ? ` • ${f.type}` : ''}`} />
                </ListItem>
              ))}
            </List>

            {uploading && (
              <Stack direction='row' alignItems='center' spacing={1}>
                <CircularProgress size={18} />
                <Typography variant='body2' color='text.secondary'>
                  جاري الرفع...
                </Typography>
              </Stack>
            )}
          </>
        )}
      </Stack>
    </GenericDialog>
  )
}

export default FileUploadDialog
