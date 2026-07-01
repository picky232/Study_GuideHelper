import { useState, useEffect } from 'react'
import { requestNotificationPermission, onForegroundMessage } from '../../infrastructure/fcm/fcmClient'

export function useFcm() {
  const [permission, setPermission] = useState(Notification.permission)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (permission !== 'granted') return

    // 이미 허용된 경우 토큰 갱신 등록
    requestNotificationPermission().catch(() => null)

    const unsubscribe = onForegroundMessage((payload) => {
      const { title, body } = payload.notification || {}
      if (Notification.permission === 'granted') {
        new Notification(title || '학습 설계 도우미', { body, icon: '/favicon.svg' })
      }
    })

    return unsubscribe
  }, [permission])

  async function requestPermission() {
    setLoading(true)
    setError(null)
    try {
      const token = await requestNotificationPermission()
      setPermission(Notification.permission)
      return token
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  return { permission, loading, error, requestPermission }
}
