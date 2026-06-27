import { useState, useEffect } from 'react'
import apiClient from '../../infrastructure/api/client'

export function useCalendar(year, month) {
  const [scheduleMap, setScheduleMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      const from = `${year}-${String(month).padStart(2, '0')}-01`
      const lastDay = new Date(year, month, 0).getDate()
      const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
      try {
        const { data } = await apiClient.get('/schedule', { params: { from, to } })
        const map = {}
        for (const s of data.schedules) {
          if (!map[s.date]) map[s.date] = []
          map[s.date].push(s)
        }
        setScheduleMap(map)
      } catch {
        setScheduleMap({})
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [year, month])

  function updateDone(id, isDone) {
    setScheduleMap((prev) => {
      const next = { ...prev }
      for (const date of Object.keys(next)) {
        next[date] = next[date].map((s) => s.id === id ? { ...s, is_done: isDone } : s)
      }
      return next
    })
  }

  return { scheduleMap, loading, updateDone }
}
