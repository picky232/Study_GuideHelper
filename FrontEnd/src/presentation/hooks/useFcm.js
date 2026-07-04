import { useState, useEffect } from 'react'
import { requestNotificationPermission, onForegroundMessage, reportFcmError } from '../../infrastructure/fcm/fcmClient'
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
    requestNotificationPermission().catch((err) => reportFcmError('auto-register', err))

    const unsubscribe = onForegroundMessage((payload) => {
      const { title, body } = payload.notification || {}
      if (Notification.permission === 'granted') {
        // 서비스워커(백그라운드 핸들러)와 같은 tag를 사용 — 동일 메시지가
        // 두 경로로 동시에 뜨더라도 OS가 하나로 합쳐 중복 표시를 막음
        new Notification(title || '학습 설계 도우미', { body, icon: '/favicon.svg', tag: 'study-reminder' })
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
