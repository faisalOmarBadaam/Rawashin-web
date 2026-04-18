'use client'

import type { MutableRefObject } from 'react'

import Box from '@mui/material/Box'

import type { ClientDto } from '@/types/api/clients'

import CardFace from './CardFace'
import { CARD_HEIGHT_MM, CARD_WIDTH_MM, type CardVariant } from './cardConfig'

import './card-print.css'

type LayoutMode = 'preview' | 'print'

type PageSize = {
  widthMm: number
  heightMm: number
}

type Props = {
  clients: ClientDto[]
  variant: CardVariant
  layout: LayoutMode
  cardRefs?: MutableRefObject<(HTMLDivElement | null)[]>
  cardsPerPage?: number
  pageSize?: PageSize
}

const buildPages = (clients: ClientDto[], cardsPerPage: number) => {
  const pages: ClientDto[][] = []

  for (let i = 0; i < clients.length; i += cardsPerPage) {
    pages.push(clients.slice(i, i + cardsPerPage))
  }

  return pages
}

export default function CardRenderer({
  clients,
  variant,
  layout,
  cardRefs,
  cardsPerPage = 1,
  pageSize = { widthMm: CARD_WIDTH_MM, heightMm: CARD_HEIGHT_MM }
}: Props) {
  if (layout === 'preview') {
    return (
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns:
            clients.length === 1
              ? '1fr'
              : 'repeat(auto-fill, minmax(90mm, 1fr))',
          gap: clients.length === 1 ? 0 : '16mm',
          justifyItems: 'center',
          alignItems: 'center'
        }}
      >
        {clients.map(client => (
          <CardFace key={client.id} client={client} variant={variant} />
        ))}
      </Box>
    )
  }

  const pages = buildPages(clients, cardsPerPage)
  let faceIndex = 0

  return (
    <Box className="card-print-root">
      <style>{`
        @media print {
          @page {
            size: ${pageSize.widthMm}mm ${pageSize.heightMm}mm;
            margin: 0;
          }
        }
      `}</style>

      <Box className="card-print-pages">
        {pages.map((pageClients, pageIndex) => (
          <Box key={`${pageIndex}-${pageClients[0]?.id ?? 'page'}`} className="card-print-page">
            <Box className="card-print-grid">
              {pageClients.map(client => {
                const index = faceIndex
                faceIndex += 1

                return (
                  <CardFace
                    key={client.id}
                    client={client}
                    variant={variant}
                    cardRef={(el: HTMLDivElement | null) => {
                      if (!cardRefs) return
                      cardRefs.current[index] = el
                    }}
                  />
                )
              })}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  )
}
