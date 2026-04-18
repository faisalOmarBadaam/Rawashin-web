'use client'

import { forwardRef } from 'react'

import QRCode from 'react-qr-code'

import styles from './PrintReceipt.module.css'

export type PrintReceiptRow = {
  label: string
  value: string
  highlight?: boolean
}

export type PrintReceiptProps = {
  title: string
  subtitle?: string
  rows: PrintReceiptRow[]
  footerText?: string
  logoUrl?: string
  qrValue?: string
  size?: '80mm' | '58mm'
}

const PrintReceipt = forwardRef<HTMLElement, PrintReceiptProps>(
  function PrintReceipt(
    { title, subtitle, rows, footerText, logoUrl, qrValue, size = '80mm' },
    ref
  ) {
    // ✅ IMPORTANT: CSS Modules cannot use class names starting with numbers
    const sizeClass = size === '58mm' ? styles.size58 : styles.size80

    return (
      <article
        ref={ref}
        aria-label="pos-receipt-print"
        className={`${styles.page} ${sizeClass}`}
      >
        {/* ===== HEADER ===== */}
        <header className={styles.header}>
          {logoUrl && (
            <img
              src={logoUrl}
              alt="receipt-logo"
              className={styles.logo}
            />
          )}

          <h2 className={styles.title}>{title}</h2>

          {subtitle && (
            <p className={styles.subtitle}>{subtitle}</p>
          )}
        </header>

        <div className={styles.separator} />

        {/* ===== BODY ===== */}
        <section className={styles.body}>
          {rows.map((row, idx) => (
            <div
              key={`${row.label}-${idx}`}
              className={`${styles.row} ${
                row.highlight ? styles.highlightRow : ''
              }`}
            >
              <span className={styles.label}>{row.label}</span>
              <span className={styles.value}>{row.value}</span>
            </div>
          ))}
        </section>

        {/* ===== QR ===== */}
        {qrValue && (
          <>
            <div className={styles.separator} />
            <div className={styles.qrWrap}>
              <QRCode
                value={qrValue}
                level="H"
                bgColor="#ffffff"
                fgColor="#000000"
                style={{ width: '60%', height: '60%' }}
              />
            </div>
          </>
        )}

        {/* ===== FOOTER ===== */}
        {footerText && (
          <>
            <div className={styles.separator} />
            <footer className={styles.footer}>
              {footerText}
            </footer>
          </>
        )}
      </article>
    )
  }
)

export default PrintReceipt
