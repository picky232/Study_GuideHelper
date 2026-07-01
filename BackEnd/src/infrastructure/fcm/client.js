import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getMessaging } from 'firebase-admin/messaging'

export function getFcmApp() {
  if (getApps().length) return getApps()[0]

  const raw = process.env.FCM_SERVICE_ACCOUNT_KEY
  if (!raw) throw new Error('FCM_SERVICE_ACCOUNT_KEY가 없습니다')

  return initializeApp({ credential: cert(JSON.parse(raw)) })
}

export function getMessagingClient() {
  getFcmApp()
  return getMessaging()
}
