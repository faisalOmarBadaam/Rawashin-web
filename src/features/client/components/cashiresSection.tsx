import { useMemo, useState } from 'react'
import type { MouseEvent } from 'react'

import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Avatar from '@mui/material/Avatar'
import Stack from '@mui/material/Stack'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'

import type { ChipProps } from '@mui/material/Chip'

import AddIcon from '@mui/icons-material/Add'
import PersonIcon from '@mui/icons-material/Person'
import GroupIcon from '@mui/icons-material/Group'
import VisibilityIcon from '@mui/icons-material/Visibility'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import WarningAmberIcon from '@mui/icons-material/WarningAmber'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'


export type CashierRow = {
  id: string
  name: string
  status: number
  totalAmount:number
}

type CashiersSectionProps = {
  cashiers: CashierRow[]
  onAdd: () => void
  onView: (cashier: CashierRow) => void
  onEdit: (cashier: CashierRow) => void
  onSettle: (cashier: CashierRow) => void
  onDelete: (cashier: CashierRow) => void | Promise<void>
}


function getStatusChip(status?: number | null): {
  label: string
  color: ChipProps['color']
} {
  switch (status) {
    case 0:
      return { label: 'غير نشط', color: 'default' }
    case 1:
      return { label: 'نشط', color: 'success' }
    case 2:
      return { label: 'قيد الانتظار', color: 'warning' }
    default:
      return { label: '—', color: 'default' }
  }
}

export function CashiersSection({
  cashiers,
  onAdd,
  onView,
  onEdit,
  onSettle,
  onDelete,
}: CashiersSectionProps) {
  const [cashierToDelete, setCashierToDelete] = useState<CashierRow | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const [actionsAnchorEl, setActionsAnchorEl] = useState<HTMLElement | null>(null)
  const [selectedCashier, setSelectedCashier] = useState<CashierRow | null>(null)

  const isActionsMenuOpen = Boolean(actionsAnchorEl)

  const activeCount = useMemo(() => {
    return cashiers.filter((cashier) => cashier.status === 1).length
  }, [cashiers])

  const InActiveCount = useMemo(() => {
    return cashiers.filter((cashier) => cashier.status === 2).length
  }, [cashiers])

  const handleOpenActionsMenu = (
    event: MouseEvent<HTMLButtonElement>,
    cashier: CashierRow,
  ) => {
    setActionsAnchorEl(event.currentTarget)
    setSelectedCashier(cashier)
  }

  const handleCloseActionsMenu = () => {
    setActionsAnchorEl(null)
    setSelectedCashier(null)
  }

  const handleAction = (callback: (cashier: CashierRow) => void) => {
    if (!selectedCashier) return

    const cashier = selectedCashier

    handleCloseActionsMenu()
    callback(cashier)
  }

  const handleDeleteFromMenu = () => {
    if (!selectedCashier) return

    const cashier = selectedCashier

    handleCloseActionsMenu()
    setCashierToDelete(cashier)
  }

  const handleCloseDeleteDialog = () => {
    if (isDeleting) return

    setCashierToDelete(null)
  }

  const handleConfirmDelete = async () => {
    if (!cashierToDelete) return

    try {
      setIsDeleting(true)
      await onDelete(cashierToDelete)
      setCashierToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <Card variant="outlined" sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{
              alignItems: {
                xs: 'stretch',
                md: 'center',
              },
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                الكاشيرات التابعة للتاجر
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                إدارة الكاشيرات المرتبطين بهذا التاجر مع إمكانية العرض والتعديل والحذف.
              </Typography>
            </Box>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAdd}
              sx={{ alignSelf: { xs: 'stretch', md: 'center' } }}
            >
              إضافة كاشير
            </Button>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                flex: 1,
                bgcolor: 'background.default',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                إجمالي الكاشيرات
              </Typography>

              <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800 }}>
                {cashiers.length}
              </Typography>
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                flex: 1,
                bgcolor: 'background.default',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                الكاشيرات النشطين
              </Typography>

              <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800 }}>
                {activeCount}
              </Typography>
            </Paper>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                flex: 1,
                bgcolor: 'background.default',
              }}
            >
              <Typography variant="caption" color="text.secondary">
                قيد الانتظار
              </Typography>

              <Typography variant="h6" sx={{ mt: 0.5, fontWeight: 800 }}>
                {InActiveCount}
              </Typography>
            </Paper>
          </Stack>

          {cashiers.length === 0 ? (
            <Box
              sx={{
                mt: 3,
                p: 4,
                borderRadius: 3,
                border: '1px dashed',
                borderColor: 'divider',
                textAlign: 'center',
                bgcolor: 'background.default',
              }}
            >
              <Avatar sx={{ mx: 'auto', mb: 1.5, bgcolor: 'primary.main' }}>
                <GroupIcon />
              </Avatar>

              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                لا توجد كاشيرات
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                يمكنك إضافة أول كاشير لهذا التاجر من زر إضافة كاشير.
              </Typography>

              <Button variant="outlined" startIcon={<AddIcon />} onClick={onAdd} sx={{ mt: 2 }}>
                إضافة كاشير
              </Button>
            </Box>
          ) : (
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{
                mt: 3,
                borderRadius: 3,
                overflowX: 'auto',
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'background.default' }}>
                    <TableCell sx={{ fontWeight: 800 }}>الكاشير</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>الحالة</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>الرصيد</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 800 }}>
                      الإجراءات
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {cashiers.map((cashier) => {
                    const status = getStatusChip(cashier.status)

                    return (
                      <TableRow
                        key={cashier.id}
                        hover
                        sx={{
                          '&:last-child td': {
                            borderBottom: 0,
                          },
                        }}
                      >
                        <TableCell>
                          <Stack
                            direction="row"
                            spacing={1.5}
                            sx={{
                              alignItems: 'center',
                            }}
                          >
                            <Avatar sx={{ width: 38, height: 38, bgcolor: 'primary.main' }}>
                              <PersonIcon fontSize="small" />
                            </Avatar>

                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                  {cashier.name}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        <TableCell>
                          <Chip size="small" label={status.label} color={status.color} />
                        </TableCell>

                        <TableCell>{cashier.totalAmount}</TableCell>

                        <TableCell align="center">
                          <Tooltip title="الإجراءات">
                            <IconButton
                              size="small"
                              onClick={(event) => handleOpenActionsMenu(event, cashier)}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Menu
        anchorEl={actionsAnchorEl}
        open={isActionsMenuOpen}
        onClose={handleCloseActionsMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuItem onClick={() => handleAction(onView)}>
          <ListItemIcon>
            <VisibilityIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="عرض" />
        </MenuItem>

        <MenuItem onClick={() => handleAction(onEdit)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="تعديل" />
        </MenuItem>

        <MenuItem onClick={() => handleAction(onSettle)}>
          <ListItemIcon>
            <ReceiptLongIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="عمل تسوية" />
        </MenuItem>

        <Divider />

        <MenuItem onClick={handleDeleteFromMenu} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="حذف" />
        </MenuItem>
      </Menu>

      <Dialog
        open={Boolean(cashierToDelete)}
        onClose={handleCloseDeleteDialog}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle sx={{ fontWeight: 800 }}>حذف الكاشير</DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{
              pt: 1,
              textAlign: 'center',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ bgcolor: 'error.main' }}>
              <WarningAmberIcon />
            </Avatar>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                هل أنت متأكد من حذف هذا الكاشير؟
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                سيتم حذف الكاشير{' '}
                <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {cashierToDelete ? cashierToDelete.name : ''}
                </Box>
                .
              </Typography>
            </Box>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button onClick={handleCloseDeleteDialog} disabled={isDeleting}>
            إلغاء
          </Button>

          <Button
            color="error"
            variant="contained"
            onClick={handleConfirmDelete}
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : undefined}
          >
            {isDeleting ? 'جاري الحذف' : 'حذف'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}