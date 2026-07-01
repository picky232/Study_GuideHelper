import { useState, useEffect } from 'react'
import apiClient from '../../infrastructure/api/client'

export function useSchedulesByGoals(goals, date, enabled = true) {
  const [schedulesByGoal, setSchedulesByGoal] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!enabled) {
      setLoading(true)
      return
    }
    if (!goals || goals.length === 0) {
      setSchedulesByGoal({})
      setLoading(false)
      return
    }

    setLoading(true)
    Promise.all(
      goals.map((g) =>
        apiClient
          .get('/schedule', { params: { date, goalId: g.id } })
          .then((res) => ({ goalId: g.id, schedules: res.data.schedules }))
          .catch(() => ({ goalId: g.id, schedules: [] }))
      )
    ).then((results) => {
      const map = {}
      results.forEach(({ goalId, schedules }) => {
        map[goalId] = schedules
      })
      setSchedulesByGoal(map)
      setLoading(false)
    })
  }, [goals, date, enabled])

  function updateDone(taskId, goalId, isDone) {
    setSchedulesByGoal((prev) => ({
      ...prev,
      [goalId]: (prev[goalId] || []).map((s) =>
        s.id === taskId ? { ...s, is_done: isDone } : s
      ),
    }))
  }

  return { schedulesByGoal, loading, updateDone }
}
