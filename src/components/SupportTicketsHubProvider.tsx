'use client'

import { useEffect, useRef } from 'react'

import type { MessagePayload } from 'firebase/messaging'

import { toast } from 'react-toastify'

import { useAuthStore } from '@/contexts/auth/auth.store'
import { subscribeFirebaseMessages } from '@/libs/firebase/messaging'

const isDev = process.env.NODE_ENV === 'development'

const devLog = (...args: unknown[]) => {
  if (!isDev) return
  console.warn(...args)
}

export default function SupportTicketsHubProvider() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated)
  const unsubscribeRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    let disposed = false

    if (!isAuthenticated) return

    const subscribe = async () => {
      try {
        const unsubscribe = await subscribeFirebaseMessages((payload: MessagePayload) => {
          if (disposed) return

          const messageType = payload.data?.type ?? payload.data?.eventType

          if (messageType && messageType !== 'supportTicketCreated') {
            return
          }

          toast.info('تذكرة دعم فني جديدة', { toastId: `support-ticket-${Date.now()}` })
        })

        if (disposed) {
          unsubscribe?.()
          return
        }

        unsubscribeRef.current = unsubscribe
      } catch (error) {
        devLog('[Firebase] failed to subscribe support ticket notifications', error)
      }
    }

    subscribe()

    return () => {
      disposed = true

      unsubscribeRef.current?.()
      unsubscribeRef.current = null
    }
  }, [isAuthenticated])

  return null
}
