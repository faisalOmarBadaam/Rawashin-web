'use client'

import { useMemo, useRef, useState } from 'react'

import Box from '@mui/material/Box'
import Button from '@mui/material/Button'

import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'

import GenericDialog from '@/components/dialogs/GenericDialog'
import usePrintContent from '@/components/print/usePrintContent'

import type { SettlementDto } from '@/types/api/settlements'
import PrintSettlementNotification from './PrintSettlementNotification'
import PrintSettlementVoucher from './PrintSettlementVoucher'

export type PrintSettlementDialogProps = {
  open: boolean
  settlement: SettlementDto
  onClose: () => void
  onPrinted?: () => void
  onPrintError?: () => void
  printType?: 'voucher' | 'notification'
}

export default function PrintSettlementDialog({
  open,
  settlement,
  onClose,
  onPrinted,
  onPrintError,
  printType = 'notification'
}: PrintSettlementDialogProps) {
  const printRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)

  const printableContent = useMemo(() => {
  return printType === 'voucher' ? (
    <PrintSettlementVoucher settlement={settlement} />
  ) : (
    <PrintSettlementNotification settlement={settlement} />
  )
}, [printType, settlement])



  const handlePrint = usePrintContent({
    contentRef: printRef,
    documentTitle: `settlement-${settlement.id ?? 'print'}-${printType}`,
    onAfterPrint: () => onPrinted?.(),
    onPrintError: () => onPrintError?.()
  })

  const handleExportPdf = async () => {
    if (!printRef.current || exporting) return

    setExporting(true)

    try {
      const element = printRef.current
      const { width, height } = element.getBoundingClientRect()
      const dataUrl = await toPng(element, {
        pixelRatio: 3,
        cacheBust: true
      })

      const pdf = new jsPDF({
        orientation: height > width ? 'portrait' : 'landscape',
        unit: 'px',
        format: [width, height]
      })

      pdf.addImage(dataUrl, 'PNG', 0, 0, width, height)
      pdf.save(`settlement${settlement.id ?? 'print'}${printType}.pdf`)
    } finally {
      setExporting(false)
    }
  }

  return (
    <GenericDialog
      open={open}
      title="معاينة الطباعة"
      onClose={onClose}
      onSubmit={() => handlePrint()}
      submitText="طباعة"
      extraActions={
        <Button
          variant="outlined"
          onClick={handleExportPdf}
          startIcon={<i className="ri-file-pdf-line" />}
          disabled={exporting}
        >
          تصدير PDF
        </Button>
      }
      maxWidth="sm"
      fullWidth
    >
      <Box
        id="printarea"
        sx={{
          display: 'flex',
          justifyContent: 'center'
        }}
      >
        <div ref={printRef}>
          {printableContent}
        </div>
      </Box>
    </GenericDialog>
  )
}
