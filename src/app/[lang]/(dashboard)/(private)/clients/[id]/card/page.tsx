'use client'

import { useEffect } from 'react'

import { useParams } from 'next/navigation'

import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

import CardPrinter from '@/components/cards/CardPrinter'
import { useClientsStore } from '@/contexts/clients/clients.store'
import { ClientType } from '@/types/api/clients'

export default function ClientCardPage() {
  const { id } = useParams<{ id: string }>()
  const { selectedClient, fetchClientById, loading } = useClientsStore()

  useEffect(() => {
    fetchClientById(id)
  }, [id])

  if (loading || !selectedClient) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    )
  }

  if (selectedClient.clientType !== ClientType.Client) {
    return null
  }

  return <CardPrinter clients={[selectedClient]} showActions variant="clients" />
}
