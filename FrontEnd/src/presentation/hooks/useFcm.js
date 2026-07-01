import { useState, useEffect } from 'react'
import { requestNotificationPermission, onForegroundMessage } from '../../infrastructure/fcm/fcmClient'
import apiClient from '../../infrastructure/api/client'

const NOTIFY_KEY = 'notify_enabled'

export function useFcm() {
  const [permission, setPermission] = useState(Notification.permission)
  const [enabled, setEnabled] = useState(() => localStorage.getItem(NOTIFY_KEY) !== 'false')
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
      setEnabled(true)
      localStorage.setItem(NOTIFY_KEY, 'true')
      return token
    } catch (err) {
      setError(err.message)
      return null
    } finally {
      setLoading(false)
    }
  }

  async function disableNotification() {
    setLoading(true)
    setError(null)
    try {
      await apiClient.delete('/notify/unregister')
      setEnabled(false)
      localStorage.setItem(NOTIFY_KEY, 'false')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { permission, enabled, loading, error, requestPermission, disableNotification }
}
