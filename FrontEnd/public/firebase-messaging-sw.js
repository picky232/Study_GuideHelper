importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY || 'AIzaSyD25cX2U-2ITruP-D5k2gGgoSG_fmfa0Vs',
  projectId: 'study-guidehelper',
  messagingSenderId: '1047293130829',
  appId: '1:1047293130829:web:1e09cffa44fae9a53bc404',
})

const messaging = firebase.messaging()

// 실제로 어느 버전의 서비스워커가 푸시를 처리하는지 확정하기 위한 진단용 마커.
// 파일 내용이 바뀔 때마다 값도 바꿔서, 로그에 찍힌 버전으로 "지금 활성화된
// 워커가 최신 코드인지"를 원격에서 확인할 수 있게 함.
const SW_VERSION = 'v3-scope-tag-2026-07-05'

messaging.onBackgroundMessage((payload) => {
  // showNotification과 별개로, 지금 이 핸들러가 정말 실행됐는지·몇 번 실행됐는지를
  // 서버 로그로 남김 (알림 표시를 막지 않도록 await 없이 fire-and-forget)
  fetch('https://study-guide-helper.vercel.app/api/notify/debug-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      context: 'sw-onBackgroundMessage',
      message: `version=${SW_VERSION} scope=${self.registration.scope} title=${payload.notification?.title}`,
    }),
  }).catch(() => null)

  const { title, body } = payload.notification || {}
  self.registration.showNotification(title || '학습 설계 도우미', {
    body: body || '학습 알림이 도착했습니다.',
    icon: '/favicon.svg',
    badge: '/favicon.svg',
    // 포그라운드 핸들러와 같은 tag — 같은 메시지가 두 경로로 동시에 와도
    // OS가 알림 하나로 합쳐서 중복 표시를 막음
    tag: 'study-reminder',
    data: payload.fcmOptions || {},
  })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification.data?.link || '/'
  event.waitUntil(clients.openWindow(url))
})
