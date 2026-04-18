'use client'

import { useEffect, useRef } from 'react'

import QRCodeStyling from 'qr-code-styling'

type Props = {
  value: string
}

export default function QRCodeWithLogo({ value }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const qrRef = useRef<QRCodeStyling | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    if (!qrRef.current) {
      qrRef.current = new QRCodeStyling({
        width: 120,
        height: 120,
        data: value,
        image: '/images/logo.png',
        backgroundOptions: {
          color: '#ffffff'
        },
        dotsOptions: {
          color: '#000000',
          type: 'square'
        },
        imageOptions: {
          margin: 6,
          crossOrigin: 'anonymous'
        },
        qrOptions: {
          errorCorrectionLevel: 'H'
        }
      })

      qrRef.current.append(containerRef.current)
    } else {
      qrRef.current.update({ data: value })
    }
  }, [value])

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
}
