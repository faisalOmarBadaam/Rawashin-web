'use client'

import type { RefObject } from 'react'

import { useReactToPrint } from 'react-to-print'

type UsePrintContentOptions = {
  contentRef: RefObject<HTMLElement | null>
  documentTitle?: string
  onAfterPrint?: () => void
  onPrintError?: () => void
}

export default function usePrintContent({
  contentRef,
  documentTitle,
  onAfterPrint,
  onPrintError
}: UsePrintContentOptions) {
  return useReactToPrint({
    contentRef,
    documentTitle,
    onAfterPrint,
    onPrintError: () => onPrintError?.()
  })
}
