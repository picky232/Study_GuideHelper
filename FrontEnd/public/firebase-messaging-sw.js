importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: self.FIREBASE_API_KEY || 'AIzaSyD25cX2U-2ITruP-D5k2gGgoSG_fmfa0Vs',
  projectId: 'study-guidehelper',
  messagingSenderId: '1047293130829',
  appId: '1:1047293130829:web:1e09cffa44fae9a53bc404',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
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
