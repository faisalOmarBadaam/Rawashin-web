'use client'

import { forwardRef, type CSSProperties } from 'react'

import QRCode from 'react-qr-code'

export type PrintCardProps = {
  cardNumber: string
  backgroundUrl: string
  logoUrl?: string
  logoSizeMm?: number
}

const formatCardNumber = (v: string) =>
  v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()

const PrintCard = forwardRef<HTMLDivElement, PrintCardProps>(function PrintCard(
  { cardNumber, backgroundUrl, logoUrl = '/images/logo.png', logoSizeMm = 4 },
  ref
) {
  const normalizedNumber = formatCardNumber(cardNumber)
  const qrValue = cardNumber.replace(/\s+/g, '')

  return (
    <div
      ref={ref}
      className="client-print-card client-print-card-front"
      style={
        {
          ['--card-logo-size' as keyof CSSProperties]: `${logoSizeMm}mm`
        }
      }
    >
      {/* background */}
      <img
        src={backgroundUrl}
        className="client-print-card-bg"
        alt=""
      />

      {/* QR */}
      <div className="client-print-front-qr-box">
        <QRCode
          value={qrValue}
          level="H"
          bgColor="#ffffff"
          fgColor="#000000"
          style={{ width: '100%', height: '100%' }}
        />

        <div className="client-print-front-qr-logo">
          <img
            src={logoUrl}
            alt="logo"
            className="client-print-front-qr-logo-img"
          />
        </div>
      </div>

      {/* card number */}
      <p className="client-print-front-card-number">
        {normalizedNumber}
      </p>
    </div>
  )
})

export default PrintCard
