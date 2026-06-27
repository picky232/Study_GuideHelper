import { useState, useEffect } from 'react'
import apiClient from '../../infrastructure/api/client'

export function useGoal() {
  const [goal, setGoal] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const { data } = await apiClient.get('/goal')
        setGoal(data.goals[0] || null)
      } catch {
        setGoal(null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { goal, loading }
}
