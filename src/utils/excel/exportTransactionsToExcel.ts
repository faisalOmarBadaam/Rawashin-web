import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

import type { TransactionForClientDto } from '@/types/api/transaction'

type ExportArgs = {
  rows: TransactionForClientDto[]
  hasMarchantName: boolean
  fileName?: string
}

const safe = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : v)

export function exportTransactionsToExcel({ rows, hasMarchantName, fileName = 'transactions.xlsx' }: ExportArgs) {
  const data = rows.map((row, idx) => {
    const base: Record<string, any> = {
      '#': idx + 1,
      المرجع: safe(row.referenceId),
      المبلغ: row.amount ?? 0,
      الوصف: safe(row.description),
      التاريخ: row.createdAt ? new Date(row.createdAt).toLocaleString() : '—'
    }

    if (hasMarchantName) {
      base['نقطة البيع'] = safe((row as any).marchantName)
    }

    return base
  })

  const ws = XLSX.utils.json_to_sheet(data)

  // عرض أعمدة مقبول
  ws['!cols'] = Object.keys(data?.[0] ?? {}).map(() => ({ wch: 22 }))

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Transactions')

  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  saveAs(
    new Blob([out], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }),
    fileName
  )
}
