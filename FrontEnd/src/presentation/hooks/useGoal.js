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

  return { goal: selectedGoal, goals, loading, selectGoal }
}
