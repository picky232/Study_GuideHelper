import { useState, useEffect, useCallback } from 'react'
import apiClient from '../../infrastructure/api/client'

export function useSchedule(date) {
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchSchedules = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await apiClient.get('/schedule', { params: { date } })
      setSchedules(data.schedules)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, [date])

  useEffect(() => { fetchSchedules() }, [fetchSchedules])

  async function toggleDone(id, currentDone) {
    setSchedules((prev) =>
      prev.map((s) => (s.id === id ? { ...s, is_done: !currentDone } : s))
    )
    try {
      await apiClient.patch('/schedule', { id, is_done: !currentDone })
    } catch (err) {
      setSchedules((prev) =>
        prev.map((s) => (s.id === id ? { ...s, is_done: currentDone } : s))
      )
    }
  }

  return { schedules, loading, error, toggleDone, refetch: fetchSchedules }
}
