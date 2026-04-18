'use client'

import { useEffect, useMemo, useState } from 'react'

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import ServerDataGrid from '@/components/datagrid/ServerDataGrid'
import SettlementsFiltersBar from './components/SettlementsFiltersBar'

import { useSettlementsStore } from '@/contexts/settlements/settlements.store'
import { normalizeListQuery } from '@/shared/listing/listQuery.normalize'
import type { SettlementDto } from '@/types/api/settlements'

import { clientSettlments } from './components/clientSettlments'

type Props = {
  clientId: string
}

export default function ClientSettlementsPage({ clientId }: Props) {
  const { query, setQuery, getClientSettlements } = useSettlementsStore()

  const [rows, setRows] = useState<SettlementDto[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const columns = useMemo(() => clientSettlments({}), [])

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Typography variant="h6" fontWeight={700}>
            تسويات نقطة البيع
          </Typography>

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
            error={error}
          />
        </Stack>
      </CardContent>
    </Card>
  )
}
