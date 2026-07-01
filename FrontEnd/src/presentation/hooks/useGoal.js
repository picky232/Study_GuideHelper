import { useState, useEffect } from 'react'
import apiClient from '../../infrastructure/api/client'

export function useGoal() {
  const [goals, setGoals] = useState([])
  const [selectedGoal, setSelectedGoal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await apiClient.get('/goal')
        setGoals(data.goals)
        const saved = localStorage.getItem('selectedGoalId')
        const found = saved ? data.goals.find((g) => g.id === saved) : null
        setSelectedGoal(found || data.goals[0] || null)
      } catch {
        setGoals([])
        setSelectedGoal(null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  function selectGoal(goal) {
    setSelectedGoal(goal)
    localStorage.setItem('selectedGoalId', goal.id)
  }

  async function deleteGoal(goalId) {
    await apiClient.delete(`/goal?id=${goalId}`)
    const remaining = goals.filter((g) => g.id !== goalId)
    setGoals(remaining)
    if (selectedGoal?.id === goalId) {
      const next = remaining[0] || null
      setSelectedGoal(next)
      if (next) localStorage.setItem('selectedGoalId', next.id)
      else localStorage.removeItem('selectedGoalId')
    }
  }

  return { goal: selectedGoal, goals, loading, selectGoal, deleteGoal }
}
