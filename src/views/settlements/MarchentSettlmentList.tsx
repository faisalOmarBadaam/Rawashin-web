'use client'

import { useEffect, useMemo, useState } from 'react'

import { useRouter } from 'next/navigation'

import Autocomplete from '@mui/material/Autocomplete'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { toast } from 'react-toastify'

import { ClientsApi } from '@/libs/api/modules/clients.api'
import { TransactionsApi } from '@/libs/api/modules/transactions.api'

import ServerDataGrid from '@/components/datagrid/ServerDataGrid'
import GenericDialog from '@/components/dialogs/GenericDialog'
import SettlementsFiltersBar from './components/SettlementsFiltersBar'

import { useSettlementsStore } from '@/contexts/settlements/settlements.store'
import { normalizeListQuery } from '@/shared/listing/listQuery.normalize'
import type { SettlementDto } from '@/types/api/settlements'

import { MarchentColumn } from './components/MarchentColumn'

type Props = {
  clientId: string
}

export default function MarchentSettlmentList({ clientId }: Props) {
  const router = useRouter()
  const {
    query,
    setQuery,
    getClientSettlements,
    createSettlement,
    updateSettlement,
    settleSubMerchants,
  } = useSettlementsStore()

  const [rows, setRows] = useState<SettlementDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [openRequestDialog, setOpenRequestDialog] = useState(false)
  const [requesting, setRequesting] = useState(false)
  const [grossAmount, setGrossAmount] = useState('0.01')
  const [description, setDescription] = useState('')
  const [editingSettlement, setEditingSettlement] = useState<SettlementDto | null>(null)
  const [openSettleSubMerchantsDialog, setOpenSettleSubMerchantsDialog] = useState(false)
  const [settlingSubMerchants, setSettlingSubMerchants] = useState(false)

  const [lookupChildren, setLookupChildren] = useState<{ id: string; name: string }[]>([])
  const [selectedChildren, setSelectedChildren] = useState<{ id: string; name: string }[]>([])
  const [childrenLoading, setChildrenLoading] = useState(false)
  const [selectedTotal, setSelectedTotal] = useState<number | null>(null)
  const [totalLoading, setTotalLoading] = useState(false)

  useEffect(() => {
    let active = true

    if (openSettleSubMerchantsDialog) {
      setChildrenLoading(true)
      ClientsApi.lookupChildren(clientId)
        .then(data => {
          if (active) setLookupChildren(data || [])
        })
        .catch(() => {
          if (active) toast.error('تعذر جلب قائمة التابعين')
        })
        .finally(() => {
          if (active) setChildrenLoading(false)
        })
    } else {
      setLookupChildren([])
      setSelectedChildren([])
      setSelectedTotal(null)
    }

    return () => {
      active = false
    }
  }, [openSettleSubMerchantsDialog, clientId])

  useEffect(() => {
    let active = true

    if (selectedChildren.length > 0) {
      setTotalLoading(true)
      TransactionsApi.getBalancesTotal({ clientsIds: selectedChildren.map(c => c.id) })
        .then(total => {
          if (active) setSelectedTotal(total)
        })
        .catch(() => {
          if (active) {
            toast.error('تعذر حساب الإجمالي المجمع')
            setSelectedTotal(null)
          }
        })
        .finally(() => {
          if (active) setTotalLoading(false)
        })
    } else {
      setSelectedTotal(null)
    }

    return () => {
      active = false
    }
  }, [selectedChildren])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)

    getClientSettlements(clientId, query)
      .then(data => {
        if (!active) return
        setRows(data.items ?? [])
        setTotalCount(data.totalCount)
      })
      .catch(e => {
        if (!active) return
        setError(e?.message ?? 'تعذر جلب التسويات نقطة البيع')
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [
    clientId,
    query.PageNumber,
    query.PageSize,
    query.Search,
    query.Status,
    query.FromDate,
    query.ToDate,
    query.SortBy,
    query.IsDesc,
    getClientSettlements,
  ])

  const columns = useMemo(
    () =>
      MarchentColumn({
        onView: settlement => {
          if (settlement.id) {
            router.push(`/merchant-settlements/${settlement.id}/view`)
            return
          }

          toast.error('لا يوجد معرف للتسوية')
        },
        onEdit: settlement => {
          setEditingSettlement(settlement)
          setGrossAmount(String(settlement.grossAmount ?? 0.01))
          setDescription(settlement.description ?? '')
          setOpenRequestDialog(true)
        },
      }),
    [router],
  )

  const handleSubmitSettlement = async () => {
    const parsedAmount = Number(grossAmount)

    if (!Number.isFinite(parsedAmount) || parsedAmount < 0.01) {
      toast.error('الحد الأدنى للمبلغ 0.01')
      return
    }

    try {
      setRequesting(true)

      if (editingSettlement) {
        await updateSettlement(editingSettlement.id, {
          grossAmount: parsedAmount,
          description: description || null,
        })
      } else {
        await createSettlement(clientId, {
          grossAmount: parsedAmount,
          description: description || null,
        })
      }

      toast.success(editingSettlement ? 'تم تعديل طلب التسوية بنجاح' : 'تم إرسال طلب التسوية بنجاح')
      setOpenRequestDialog(false)
      setGrossAmount('0.01')
      setDescription('')
      setEditingSettlement(null)

      const data = await getClientSettlements(clientId, query)
      setRows(data.items ?? [])
      setTotalCount(data.totalCount)
    } catch (e: any) {
      toast.error(e?.message ?? 'تعذر حفظ طلب التسوية')
    } finally {
      setRequesting(false)
    }
  }

  const handleSettleSubMerchants = async () => {
    try {
      setSettlingSubMerchants(true)
      console.log('selectedChildren BEFORE:', selectedChildren)

      const payload =
        selectedChildren.length > 0 ? { subMerchantId: selectedChildren.map(c => c.id) } : {}
      console.log('payload:', payload)

      const result = await settleSubMerchants(clientId, payload)

      toast.success(
        `تمت تسوية ${result.settledChildrenCount} تاجر فرعي بإجمالي ${result.totalAmount.toLocaleString()}`,
      )

      setOpenSettleSubMerchantsDialog(false)

      const data = await getClientSettlements(clientId, query)
      setRows(data.items ?? [])
      setTotalCount(data.totalCount)
    } catch (e: any) {
      toast.error(e?.message ?? 'تعذر تنفيذ تسوية التابعين')
    } finally {
      setSettlingSubMerchants(false)
    }
  }
  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
          >
            <Typography variant="h6" fontWeight={700}>
              تسويات الحسابات الفرعية
            </Typography>

            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={() => setOpenSettleSubMerchantsDialog(true)}>
                تسوية التابعين
              </Button>

              <Button
                variant="contained"
                onClick={() => {
                  setEditingSettlement(null)
                  setGrossAmount('0.01')
                  setDescription('')
                  setOpenRequestDialog(true)
                }}
              >
                طلب تسوية
              </Button>
            </Stack>
          </Stack>

          <SettlementsFiltersBar />

          <ServerDataGrid<SettlementDto>
            rows={rows}
            columns={columns}
            loading={loading}
            totalCount={totalCount}
            query={query}
            filters={{
              Status: query.Status,
              FromDate: query.FromDate,
              ToDate: query.ToDate,
            }}
            onQueryChange={nextQuery =>
              setQuery(
                normalizeListQuery(nextQuery, 'clientSettlements') as Partial<typeof query>,
                {
                  resetPage: false,
                },
              )
            }
            getRowId={row => row.id}
            onRowDoubleClick={row => {
              if (row.id) {
                router.push(`/merchant-settlements/${row.id}/view`)
              }
            }}
            error={error}
          />

          <GenericDialog
            open={openRequestDialog}
            onClose={() => {
              if (requesting) return
              setOpenRequestDialog(false)
              setEditingSettlement(null)
            }}
            title={editingSettlement ? 'تعديل طلب التسوية' : 'طلب تسوية'}
            submitText={editingSettlement ? 'حفظ التعديل' : 'إرسال'}
            cancelText="إلغاء"
            loading={requesting}
            onSubmit={handleSubmitSettlement}
          >
            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                fullWidth
                type="number"
                size="small"
                label="المبلغ الإجمالي"
                value={grossAmount}
                inputProps={{ min: 0.01, step: 0.01 }}
                onChange={e => setGrossAmount(e.target.value)}
              />

              <TextField
                fullWidth
                size="small"
                multiline
                minRows={3}
                label="الوصف"
                value={description}
                onChange={e => setDescription(e.target.value)}
              />
            </Stack>
          </GenericDialog>

          <GenericDialog
            open={openSettleSubMerchantsDialog}
            onClose={() => {
              if (settlingSubMerchants) return
              setOpenSettleSubMerchantsDialog(false)
            }}
            title="تسوية التابعين "
            submitText="تنفيذ التسوية"
            cancelText="إلغاء"
            loading={settlingSubMerchants}
            onSubmit={handleSettleSubMerchants}
          >
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Typography variant="body2">
                هل تريد تنفيذ تسوية جميع التابعين لهذا نقطة البيع الآن؟
              </Typography>

              <Autocomplete
                multiple
                options={lookupChildren}
                getOptionLabel={option => option.name}
                loading={childrenLoading}
                value={selectedChildren}
                onChange={(_, newValue) => setSelectedChildren(newValue)}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={params => (
                  <TextField
                    {...params}
                    label="استعلام عن أرصدة تابعين محددين"
                    size="small"
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {childrenLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      ),
                    }}
                  />
                )}
              />

              {(totalLoading || selectedTotal !== null) && (
                <Card variant="outlined" sx={{ bgcolor: 'background.default' }}>
                  <CardContent sx={{ p: '12px !important' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        إجمالي أرصدة التابعين المحددين:
                      </Typography>
                      {totalLoading ? (
                        <CircularProgress size={20} />
                      ) : (
                        <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                          {selectedTotal?.toLocaleString()}
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )}

              {/* <Typography variant="caption" color="text.secondary">
                ملاحظة: تنفيذ التسوية سيشمل جميع التابعين حسب سياسة النظام، التحديد أعلاه هو لغرض
                الاستعلام فقط.
              </Typography> */}
            </Stack>
          </GenericDialog>
        </Stack>
      </CardContent>
    </Card>
  )
}
