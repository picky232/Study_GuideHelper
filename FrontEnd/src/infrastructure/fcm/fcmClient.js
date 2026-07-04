import { initializeApp, getApps } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'
import apiClient from '../api/client'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY

function getApp() {
  return getApps().length ? getApps()[0] : initializeApp(firebaseConfig)
}

export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const app = getApp()
  const messaging = getMessaging(app)

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js'),
  })

  if (token) {
    // 서비스워커 갱신 등으로 새 토큰이 발급된 경우 예전 토큰이 남아있으면
    // 발송 시 중복 알림이 감 — 등록 전 기존 토큰 정리
    const lastToken = localStorage.getItem('fcm_last_token')
    if (lastToken && lastToken !== token) {
      await apiClient.delete('/notify/unregister').catch(() => null)
    }
    await apiClient.post('/notify/register', { token })
    localStorage.setItem('fcm_last_token', token)
  }

  return token
}

export function onForegroundMessage(callback) {
  const app = getApp()
  const messaging = getMessaging(app)
  return onMessage(messaging, callback)
}
