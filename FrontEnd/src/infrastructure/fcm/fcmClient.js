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
    await apiClient.post('/notify/register', { token })
  }

  return token
}

export function onForegroundMessage(callback) {
  const app = getApp()
  const messaging = getMessaging(app)
  return onMessage(messaging, callback)
}
