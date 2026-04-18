'use client'

import { useEffect, useMemo, useState } from 'react'

import { Box, Chip, MenuItem, OutlinedInput, Select, TextField } from '@mui/material'
import { toast } from 'react-toastify'

import AlertDialog from '@/components/dialogs/AlertDialog'
import GenericDialog from '@/components/dialogs/GenericDialog'
import { AppRole } from '@/configs/roles'
import { useAuthStore } from '@/contexts/auth/auth.store'
import { useRolesStore } from '@/contexts/roles/roles.store'
import { getErrorMessage } from '@/libs/api/getErrorMessage'
import { hasRole } from '@/utils/rbac'

type Props = {
  clientId: string
  clientName: string
  open: boolean
  onClose: () => void
}

const ClientRolesDialog = ({ clientId, clientName, open, onClose }: Props) => {
  const {
    list: allRoles,
    clientRoles,
    fetchRoles,
    fetchClientRoles,
    assignRole,
    unassignRole,
  } = useRolesStore()

  const { session } = useAuthStore()
  const userRoles = session?.roles || []

  const availableRoles = useMemo(() => {
    if (hasRole(userRoles, AppRole.Admin)) {
      return allRoles
    }
    if (hasRole(userRoles, AppRole.Employee)) {
      return allRoles.filter(
        r => r !== AppRole.Admin && r !== AppRole.Profit && r !== AppRole.ProfitAccount,
      )
    }

    return []
  }, [allRoles, userRoles])

  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selectOpen, setSelectOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      fetchRoles()
      fetchClientRoles(clientId)
    }
  }, [open, clientId, fetchRoles, fetchClientRoles])

  useEffect(() => {
    setSelectedRoles(clientRoles)
  }, [clientRoles])

  const hasChanges = useMemo(() => {
    const a = [...selectedRoles].sort().join(',')
    const b = [...clientRoles].sort().join(',')
    return a !== b
  }, [selectedRoles, clientRoles])

  const handleClose = () => {
    if (saving) return
    setConfirmOpen(false)
    setSelectOpen(false)
    setSelectedRoles(clientRoles)
    onClose()
  }

  const handleSelectChange = (value: string[]) => {
    setSelectedRoles(value)
    setSelectOpen(false)
  }

  const confirmSave = async () => {
    setSaving(true)
    try {
      const toAssign = selectedRoles.filter(r => !clientRoles.includes(r))
      const toUnassign = clientRoles.filter(r => !selectedRoles.includes(r))

      await Promise.all([
        ...toAssign.map(role => assignRole(clientId, role)),
        ...toUnassign.map(role => unassignRole(clientId, role)),
      ])

      toast.success('تم تحديث الصلاحيات بنجاح')
      handleClose()
    } catch (error) {
      toast.error(getErrorMessage(error, 'فشل تحديث الصلاحيات'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <GenericDialog
        open={open && !confirmOpen}
        title="إدارة الصلاحيات"
        onClose={handleClose}
        onSubmit={() => setConfirmOpen(true)}
        submitText="حفظ"
        submitDisabled={!hasChanges || saving}
        loading={saving}
        maxWidth="sm"
      >
        <Box className="flex flex-col gap-4" dir="rtl">
          <TextField label="اسم المستخدم" fullWidth disabled value={clientName} />

          <Select
            multiple
            fullWidth
            label="الصلاحيات"
            aria-placeholder="اختر الصلاحيات"
            open={selectOpen}
            onOpen={() => setSelectOpen(true)}
            onClose={() => setSelectOpen(false)}
            value={selectedRoles}
            onChange={e => handleSelectChange(e.target.value as string[])}
            input={<OutlinedInput label="الصلاحيات" />}
            renderValue={selected => (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {(selected as string[]).map(role => (
                  <Chip key={role} label={role} />
                ))}
              </Box>
            )}
            disabled={saving}
          >
            {availableRoles.map(role => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </GenericDialog>

      <AlertDialog
        open={confirmOpen}
        title="تأكيد تحديث الصلاحيات"
        description={
          <Box>
            هل أنت متأكد من تحديث صلاحيات المستخدم <b>{clientName}</b>؟
          </Box>
        }
        confirmText="تأكيد"
        cancelText="إلغاء"
        loading={saving}
        onClose={() => !saving && setConfirmOpen(false)}
        onConfirm={confirmSave}
      />
    </>
  )
}

export default ClientRolesDialog
