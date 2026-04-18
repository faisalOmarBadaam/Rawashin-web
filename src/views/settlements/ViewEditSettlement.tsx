'use client'

import { useEffect } from 'react'

import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'

import { toast } from 'react-toastify'

import { useSettlementsStore } from '@/contexts/settlements/settlements.store'

import SettlementActions from './components/SettlementActions'
import SettlementInfoCard from './components/SettlementInfoCard'
import SettlementTransactionsList from './components/SettlementTransactionsList'

type Props = {
  settlementId: string
  mode: 'view' | 'edit'
}

export default function ViewEditSettlement({ settlementId, mode }: Props) {
  const { selectedSettlement, loading, error, fetchSettlementById } = useSettlementsStore()

  useEffect(() => {
    fetchSettlementById(settlementId)
  }, [settlementId, fetchSettlementById])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  if (loading && !selectedSettlement) {
    return (
      <Box display="flex" justifyContent="center" py={6}>
        <CircularProgress />
      </Box>
    )
  }

  if (!selectedSettlement) {
    return <Alert severity="error">{error || 'تعذر تحميل بيانات التسوية.'}</Alert>
  }

  return (
    <Stack spacing={3}>
      <SettlementInfoCard settlement={selectedSettlement} />

      {selectedSettlement.transactions?.length ? (
        <SettlementTransactionsList transactions={selectedSettlement.transactions} />
      ) : null}

      {mode === 'edit' && (
        <>
          <Divider />
          <SettlementActions settlement={selectedSettlement} />
        </>
      )}
    </Stack>
  )
}
