'use client'

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import QRCode from 'react-qr-code'

import './receipt-print.css'

export type ReceiptRow = {
  label: string
  value: string
  highlight?: boolean
}

type Props = {
  title: string
  subtitle?: string
  logoUrl?: string
  size?: '58mm' | '80mm'
  rows: ReceiptRow[]
  qrValue?: string
  footerText?: string
}

export default function GenericReceiptPrintable({
  title,
  subtitle,
  logoUrl,
  size = '80mm',
  rows,
  qrValue,
  footerText
}: Props) {
  const sizeClass = size === '58mm' ? 'size-58mm' : 'size-80mm'

  return (
    <Box className={`receipt-page ${sizeClass}`}>
      <Box className="receipt-wrapper">
        <Box className="receipt-header">
          {logoUrl && (
            <img
              src={logoUrl}
              className="receipt-logo"
              alt="logo"
            />
          )}
          <Typography className="receipt-title">
            {title}
          </Typography>
          {subtitle && (
            <Typography className="receipt-subtitle">
              {subtitle}
            </Typography>
          )}
        </Box>

        <Divider />

        <Box className="receipt-body">
          {rows.map((row, idx) => (
            <Box
              key={idx}
              className={`receipt-row${
                row.highlight ? ' highlight' : ''
              }`}
            >
              <Typography className="label">
                {row.label}
              </Typography>
              <Typography className="value">
                {row.value}
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider />

        {qrValue && (
          <Box className="receipt-qr">
            <QRCode value={qrValue} size={100} />
          </Box>
        )}

        {footerText && (
          <Box className="receipt-footer">
            <Typography className="small">
              {footerText}
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}
