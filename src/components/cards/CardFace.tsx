'use client'

import type { CSSProperties, Ref } from 'react'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import QRCode from 'react-qr-code'

import type { ClientDto } from '@/types/api/clients'

import { CARD_VARIANTS, type CardVariant } from './cardConfig'

const formatCardNumber = (v: string) =>
  v.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()

type Props = {
  client: ClientDto
  variant: CardVariant
  cardRef?: Ref<HTMLDivElement>
}

export default function CardFace({ client, variant, cardRef }: Props) {
  const rawCardNumber = client.creditAccount?.cardNumber ?? ''
  const cardNumber = rawCardNumber ? formatCardNumber(rawCardNumber) : ''
  const { backgroundSrc, logoSizeMm } = CARD_VARIANTS[variant]

  return (
    <Box
      ref={cardRef}
      className="client-print-card client-print-card-front"
      style={{
        ['--card-logo-size' as keyof CSSProperties]: `${logoSizeMm}mm`
      }}
    >
      <Box component="img" src={backgroundSrc} className="client-print-card-bg" />

      <Box className="client-print-front-qr-box">
        <QRCode
          value={rawCardNumber.replace(/\s+/g, '')}
          level="H"
          bgColor="#ffffff"
          fgColor="#000000"
          style={{ width: '100%', height: '100%' }}
        />

        <Box className="client-print-front-qr-logo">
          <img
            src="/images/logo.png"
            alt="logo"
            className="client-print-front-qr-logo-img"
          />
        </Box>
      </Box>

      <Typography className="client-print-front-card-number">
        {cardNumber}
      </Typography>
    </Box>
  )
}
