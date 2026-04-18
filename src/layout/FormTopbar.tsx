'use client'

import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  CircularProgress
} from '@mui/material'

import { Icon } from '@iconify/react'

type Mode = 'view' | 'edit' | 'add'

type Props = {
  mode?: Mode
  isDirty?: boolean
  loading?: boolean

  onEdit?: () => void
  onSave?: () => void
  onCancel?: () => void
  onDelete?: () => void
}

export default function FormTopbar({
  mode = 'view',
  isDirty = false,
  loading = false,
  onEdit,
  onSave,
  onCancel,
  onDelete
}: Props) {
  const isView = mode === 'view'
  const isEdit = mode === 'edit'
  const isAdd = mode === 'add'

  return (
    <>
      <Box
        sx={{
          px: 3,
          py: 1.5,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
          bgcolor: 'grey.50'
        }}
      >
        {/* ================= VIEW MODE ================= */}
        {isView && (
          <>
            {onEdit && (
              <Tooltip title="Edit">
                <span>
                  <IconButton onClick={onEdit}>
                    <Icon icon="mdi:pencil-outline" width={20} />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {onDelete && (
              <Tooltip title="Delete">
                <span>
                  <IconButton
                    color="error"
                    onClick={onDelete}
                  >
                    <Icon icon="mdi:delete-outline" width={20} />
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </>
        )}

        {/* ================= EDIT / ADD MODE ================= */}
        {(isEdit || isAdd) && (
          <>
            {onCancel && (
              <Tooltip title="Cancel">
                <span>
                  <IconButton
                    onClick={onCancel}
                    disabled={loading}
                  >
                    <Icon icon="mdi:close" width={20} />
                  </IconButton>
                </span>
              </Tooltip>
            )}

            {onSave && (
              <Tooltip title="Save">
                <span>
                  <IconButton
                    color="primary"
                    onClick={onSave}
                    disabled={!isDirty || loading}
                  >
                    {loading ? (
                      <CircularProgress size={18} />
                    ) : (
                      <Icon
                        icon="mdi:content-save-outline"
                        width={20}
                      />
                    )}
                  </IconButton>
                </span>
              </Tooltip>
            )}
          </>
        )}
      </Box>

      <Divider />
    </>
  )
}
