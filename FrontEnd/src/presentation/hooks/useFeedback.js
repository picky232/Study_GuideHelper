import { useState, useEffect } from 'react'
import apiClient from '../../infrastructure/api/client'

export function useFeedback() {
  const [data, setData] = useState(null)
  const [coaching, setCoaching] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadAll() {
      try {
        const [statsRes, coachRes] = await Promise.all([
          apiClient.get('/feedback'),
          apiClient.get('/feedback?coaching=true'),
        ])
        setData(statsRes.data)
        setCoaching(coachRes.data.coaching || null)
      } catch (err) {
        setError(err.response?.data?.error || err.message)
      } finally {
        setLoading(false)
      }
    }
    loadAll()
  }, [])

  return { data, coaching, loading, error }
}
