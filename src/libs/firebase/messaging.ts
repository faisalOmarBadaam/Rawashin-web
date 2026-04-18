'use client'

import {
  getMessaging,
  isSupported,
  onMessage,
  type MessagePayload,
  type Messaging,
} from 'firebase/messaging'

import { getFirebaseApp } from './app'

export const getFirebaseMessaging = async (): Promise<Messaging | null> => {
  const app = getFirebaseApp()
  if (!app) return null

  const supported = await isSupported()
  if (!supported) return null

  return getMessaging(app)
}

export const subscribeFirebaseMessages = async (
  callback: (payload: MessagePayload) => void,
): Promise<(() => void) | null> => {
  const messaging = await getFirebaseMessaging()
  if (!messaging) return null

  return onMessage(messaging, callback)
}
