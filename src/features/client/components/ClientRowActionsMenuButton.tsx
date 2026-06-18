import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { toast } from 'sonner'

import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined'
import LockResetIcon from '@mui/icons-material/LockReset'

import type { RowAction } from './RowActionsMenuButton'
import RowActionsMenuButton from './RowActionsMenuButton'
import GenericConfirmDialog from '@/shared/components/ui/GenericConfirmDialog'
import { useDeleteClient, useResetClientPassword } from '../hooks'
import ResetPasswordDialog from './ResetPasswordDialog'

type RowWithId = {
  id: string
  userName?: string
  username?: string
  name?: string
  fullName?: string
}

type ClientRowActionsMenuButtonProps<TRow extends RowWithId> = {
  row: TRow
  editPath?: string | ((row: TRow) => string)
  extraActions?: RowAction<TRow>[]
  deleteMessage?: string | ((row: TRow) => string)
  onDeleted?: (row: TRow) => void
}

export default function ClientRowActionsMenuButton<TRow extends RowWithId>({
  row,
  editPath,
  extraActions = [],
  deleteMessage = 'هل أنت متأكد من حذف هذا السجل؟',
  onDeleted,
}: ClientRowActionsMenuButtonProps<TRow>) {
  const navigate = useNavigate()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)

  const { mutateAsync: deleteClient, isPending: isDeleting } = useDeleteClient()

  const message =
    typeof deleteMessage === 'function' ? deleteMessage(row) : deleteMessage

  const username =
    row.userName ?? row.username ?? row.name ?? row.fullName ?? String(row.id)

  const handleDeleteConfirm = async () => {
    await deleteClient({
      id: row.id,
    })

    toast.success('تم الحذف بنجاح')
    setDeleteDialogOpen(false)
    onDeleted?.(row)
  }
  const { mutateAsync: resetClientPassword, isPending: isResettingPassword } = useResetClientPassword()
  const handleResetPasswordSave = async ({
    password,
  }: {
    password: string
    confirmPassword: string
  }) => {

      await resetClientPassword({
        id: row.id,
        newPassword: password
      })
      toast.success('تم تغيير كلمة المرور بنجاح')
      setResetPasswordOpen(false)
    
  }

  const actions = useMemo<RowAction<TRow>[]>(
    () => [
      {
        label: 'تعديل',
        icon: <EditOutlinedIcon fontSize="small" />,
        onClick: (selectedRow) => {
          const path =
            typeof editPath === 'function'
              ? editPath(selectedRow)
              : editPath ?? String(selectedRow.id)

          navigate(path)
        },
      },
      ...extraActions,
      {
        label: 'تغيير كلمة المرور',
        icon: <LockResetIcon fontSize="small" />,
        onClick: () => {
          setResetPasswordOpen(true)
        },
      },
      {
        label: 'حذف',
        icon: <DeleteOutlineOutlinedIcon fontSize="small" color="error" />,
        dividerBefore: true,
        disabled: isDeleting,
        onClick: () => {
          setDeleteDialogOpen(true)
        },
      },
    ],
    [editPath, extraActions, navigate, isDeleting]
  )

  return (
    <>
      <RowActionsMenuButton row={row} actions={actions} />

      <ResetPasswordDialog
        open={resetPasswordOpen}
        username={username}
        loading={isResettingPassword}
        onClose={() => setResetPasswordOpen(false)}
        onSave={handleResetPasswordSave}
      />

      <GenericConfirmDialog
        open={deleteDialogOpen}
        title="تأكيد الحذف"
        message={message}
        confirmText="حذف"
        cancelText="إلغاء"
        loading={isDeleting}
        variant="danger"
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  )
}