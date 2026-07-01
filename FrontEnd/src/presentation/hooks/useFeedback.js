import { useState, useEffect } from 'react'
import apiClient from '../../infrastructure/api/client'

export function useFeedback() {
  const [data, setData] = useState(null)
  const [coaching, setCoaching] = useState(null)
  const [loading, setLoading] = useState(true)
  const [coachingLoading, setCoachingLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await apiClient.get('/feedback')
        setData(res.data)
        setLoading(false)

        // stats 완료 후 coaching 별도 요청
        const coachRes = await apiClient.get('/feedback?coaching=true')
        setCoaching(coachRes.data.coaching || null)
      } catch (err) {
        setError(err.response?.data?.error || err.message)
        setLoading(false)
      } finally {
        setCoachingLoading(false)
      }
    }
    loadStats()
  }, [])

  return { data, coaching, loading, coachingLoading, error }
}
