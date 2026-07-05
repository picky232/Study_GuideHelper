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

// 브라우저에서만 재현되는 오류를 서버 로그로 남겨 원격 기기 없이 진단하기 위한 용도
export function reportFcmError(context, err) {
  apiClient.post('/notify/debug-log', { context, message: err?.message, stack: err?.stack }).catch(() => null)
}

// 기기에 등록된 서비스워커 목록(스코프·스크립트·상태)을 서버 로그로 남겨
// 중복 알림 원인(오래된 서비스워커 잔존 등)을 원격에서 진단하기 위한 용도
export async function reportServiceWorkerState(context) {
  try {
    const regs = await navigator.serviceWorker.getRegistrations()
    const snapshot = regs.map((r) => ({
      scope: r.scope,
      script: r.active?.scriptURL || r.waiting?.scriptURL || r.installing?.scriptURL || null,
      state: r.active?.state || r.waiting?.state || r.installing?.state || 'unknown',
    }))
    apiClient.post('/notify/debug-log', { context, message: JSON.stringify(snapshot) }).catch(() => null)
  } catch {
    // 진단 실패는 무시 — 본 기능에 영향 없음
  }
}

export async function requestNotificationPermission() {
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return null

  const app = getApp()
  const messaging = getMessaging(app)

  // 정리 전 현재 상태를 먼저 남겨 원인 확정(오래된 SW 잔존 여부 등)
  await reportServiceWorkerState('before-cleanup')

  // 과거에 스코프 '/'로 등록됐던 구버전 FCM 서비스워커가 남아있으면
  // 새 스코프로 등록해도 둘 다 살아있어 알림이 계속 중복될 수 있음 — 정리
  const existingRegs = await navigator.serviceWorker.getRegistrations()
  for (const reg of existingRegs) {
    if (reg.active?.scriptURL.includes('firebase-messaging-sw.js') && reg.scope.endsWith('/')) {
      await reg.unregister()
    }
  }

  // PWA 캐싱용 sw.js와 스코프가 겹치면 두 서비스워커가 같은 푸시 이벤트를
  // 동시에 처리해 알림이 2번 뜸 — FCM 전용 스코프를 분리해 충돌 방지
  // (Firebase 공식 권장 패턴: /firebase-cloud-messaging-push-scope)
  const fcmSwRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
    scope: '/firebase-cloud-messaging-push-scope',
  })

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: fcmSwRegistration,
  })

  if (token) {
    await apiClient.post('/notify/token', { token })
  }

  await reportServiceWorkerState('after-register')

  return token
}

export function onForegroundMessage(callback) {
  const app = getApp()
  const messaging = getMessaging(app)
  return onMessage(messaging, callback)
}
