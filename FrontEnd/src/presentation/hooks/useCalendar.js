import { useState, useEffect } from 'react'
import apiClient from '../../infrastructure/api/client'

export function useCalendar(year, month) {
  const [scheduleMap, setScheduleMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchSchedules() {
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
      } catch (err) {
        console.error('캘린더 일정 로드 실패:', err)
        setScheduleMap({})
      } finally {
        setLoading(false)
      }
    }
    fetchSchedules()
  }, [year, month])

  async function toggleDone(task) {
    const newDone = !task.is_done
    updateDone(task.id, newDone)
    try {
      await apiClient.patch('/schedule', { id: task.id, is_done: newDone })
    } catch {
      updateDone(task.id, task.is_done)
    }
  }

  function updateDone(id, isDone) {
    setScheduleMap((prev) => {
      const next = { ...prev }
      for (const date of Object.keys(next)) {
        next[date] = next[date].map((s) => s.id === id ? { ...s, is_done: isDone } : s)
      }
      return next
    })
  }

  return { scheduleMap, loading, updateDone, toggleDone }
}
