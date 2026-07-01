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
        const { data } = await apiClient.get('/feedback?coaching=true')
        setData(data)
        setCoaching(data.coaching || null)
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
