'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

import { createPortal } from 'react-dom'

import type { ClientDto } from '@/types/api/clients'

import CardRenderer from './CardRenderer'
import { CARD_HEIGHT_MM, CARD_WIDTH_MM, type CardVariant } from './cardConfig'
import { exportCardsToPdf } from './exportCardsToPdf'

type Props = {
  clients: ClientDto[]
  variant: CardVariant
  mode: 'print' | 'pdf'
  onComplete: () => void
  onProgress?: (progress: { current: number; total: number }) => void
  cardsPerPage?: number
}

export default function CardPrintJob({
  clients,
  variant,
  mode,
  onComplete,
  onProgress,
  cardsPerPage
}: Props) {
  const faceRefs = useRef<(HTMLDivElement | null)[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const pageSize = useMemo(
    () => ({ widthMm: CARD_WIDTH_MM, heightMm: CARD_HEIGHT_MM }),
    []
  )

  useEffect(() => {
    if (!mounted) return

    let didCancel = false
    document.body.classList.add('card-printing')

    const run = async () => {
      await new Promise(requestAnimationFrame)
      await new Promise(resolve => setTimeout(resolve, 50))

      if (didCancel) return

      if (mode === 'print') {
        window.print()

        if (!didCancel) {
          onComplete()
        }

        return
      }

      await exportCardsToPdf(faceRefs.current, pageSize, onProgress)

      if (!didCancel) {
        onComplete()
      }
    }

    void run()

    return () => {
      didCancel = true
      document.body.classList.remove('card-printing')
    }
  }, [mode, mounted, onComplete, onProgress, pageSize])

  if (!mounted) return null

  return createPortal(
    <CardRenderer
      clients={clients}
      variant={variant}
      layout="print"
      cardRefs={faceRefs}
      cardsPerPage={cardsPerPage}
      pageSize={pageSize}
    />,
    document.body
  )
}
