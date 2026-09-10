/**
 * CONTROLLER — useDashboardController
 * Fetches dashboard stats and exposes them to the DashboardPage View.
 */
import { useState, useEffect } from 'react'
import api from '../api'

export const useDashboardController = () => {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/tasks/dashboard')
        setStats(data.data)
      } catch (e) {
        setError('Failed to load dashboard')
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  return { stats, loading, error }
}
