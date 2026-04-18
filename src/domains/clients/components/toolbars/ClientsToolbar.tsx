'use client'

import { useState } from 'react'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import { resolveAddPath } from '@/core/engine/route.engine'
import { ClientType, type ClientDto } from '@/types/api/clients'

import PrintOptionsPanel from '../shared/PrintOptionsPanel'
import SendClientsMessageDialog from '../shared/SendClientsMessageDialog'
import UploadBatchDialog from '../shared/UploadBatchDialog'

const CLIENT_TYPE_CONFIG = [
  {
    value: ClientType.Client,
    label: 'العملاء',
    addLabel: 'إضافة مستفيد',
    typeKey: 'client',
  },
  {
    value: ClientType.Merchant,
    label: 'نقاط البيع',
    addLabel: 'إضافة نقطة بيع',
    typeKey: 'merchant',
  },
  {
    value: ClientType.Partner,
    label: 'الشركاء',
    addLabel: 'إضافة شريك',
    typeKey: 'partner',
  },
] as const

type Props = {
  activeClientType: ClientType
  selectedClients: ClientDto[]
  onRefresh: () => void
}

export default function ClientsToolbar({ activeClientType, selectedClients, onRefresh }: Props) {
  const pathname = usePathname()
  const [openPrintOptions, setOpenPrintOptions] = useState(false)
  const [openUploadDialog, setOpenUploadDialog] = useState(false)
  const [openSendMessageDialog, setOpenSendMessageDialog] = useState(false)
  const [actionsAnchor, setActionsAnchor] = useState<null | HTMLElement>(null)

  const activeConfig =
    CLIENT_TYPE_CONFIG.find(c => c.value === activeClientType) ?? CLIENT_TYPE_CONFIG[0]
  const addPath = `${resolveAddPath(pathname ?? '/clients')}?type=${activeConfig.typeKey}`

  const canPrint = activeClientType === ClientType.Client && selectedClients.length > 0
  const printDisabledReason =
    activeClientType !== ClientType.Client
      ? 'الطباعة متاحة للمستفيدين فقط'
      : selectedClients.length === 0
        ? 'يرجى تحديد مستفيد واحد على الأقل'
        : ''

  return (
    <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
      <Box className="flex flex-wrap gap-3 justify-between items-center">
        <Typography variant="h5">إدارة {activeConfig.label}</Typography>

        <Stack direction="row" spacing={1.5} alignItems="center">
          <Button
            component={NextLink}
            href={addPath}
            variant="contained"
            startIcon={<i className="ri-add-line" />}
          >
            {activeConfig.addLabel}
          </Button>

          {activeClientType === ClientType.Client && (
            <Tooltip title={printDisabledReason}>
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<i className="ri-printer-line" />}
                  disabled={!canPrint}
                  onClick={() => setOpenPrintOptions(true)}
                >
                  طباعة البطائق المتعددة
                </Button>
              </span>
            </Tooltip>
          )}

          {activeClientType === ClientType.Client && (
            <>
              <Button
                variant="outlined"
                startIcon={<i className="ri-more-2-fill" />}
                onClick={e => setActionsAnchor(e.currentTarget)}
              >
                إجراءات
              </Button>

              <Menu
                anchorEl={actionsAnchor}
                open={Boolean(actionsAnchor)}
                onClose={() => setActionsAnchor(null)}
              >
                <MenuItem
                  component="a"
                  href="/templates/prototype.xlsx"
                  download
                  onClick={() => setActionsAnchor(null)}
                >
                  <i className="ri-download-line me-2" />
                  تحميل نموذج Excel
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setActionsAnchor(null)
                    setOpenUploadDialog(true)
                  }}
                >
                  <i className="ri-upload-line me-2" />
                  رفع حسابات المستفيدين
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    setActionsAnchor(null)
                    setOpenSendMessageDialog(true)
                  }}
                >
                  <i className="ri-mail-send-line me-2" />
                  إرسال رسالة جماعية
                </MenuItem>
              </Menu>
            </>
          )}
        </Stack>
      </Box>

      {openPrintOptions && (
        <>
          <Divider />
          <PrintOptionsPanel selectedClients={selectedClients} />
        </>
      )}

      <UploadBatchDialog
        open={openUploadDialog}
        onClose={() => setOpenUploadDialog(false)}
        onSuccess={onRefresh}
      />

      <SendClientsMessageDialog
        open={openSendMessageDialog}
        onClose={() => setOpenSendMessageDialog(false)}
      />
    </Box>
  )
}
