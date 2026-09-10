import { useState, useEffect, useCallback } from 'react'
import api from '../api'
import toast from 'react-hot-toast'

export const useDepartments = () => {
  const [departments, setDepartments]       = useState([])
  const [allowedTargets, setAllowedTargets] = useState([])
  const [assignmentRules, setAssignmentRules] = useState([])
  const [loading, setLoading]               = useState(false)

  const fetchDepartments = useCallback(async () => {
    try {
      const res = await api.get('/departments')
      setDepartments(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch departments:', err)
    }
  }, [])

  const fetchAllowedTargets = useCallback(async () => {
    try {
      const res = await api.get('/departments/allowed-targets')
      setAllowedTargets(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch allowed target departments:', err)
    }
  }, [])

  const fetchAssignmentRules = useCallback(async () => {
    try {
      const res = await api.get('/assignment-rules')
      setAssignmentRules(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch assignment rules:', err)
    }
  }, [])

  const getUsersByDepartment = async (departmentId) => {
    if (!departmentId) return []
    try {
      const res = await api.get(`/departments/${departmentId}/users`)
      return res.data.data || []
    } catch (err) {
      console.error('Failed to fetch department users:', err)
      return []
    }
  }

  const createAssignmentRule = async (ruleData) => {
    try {
      const res = await api.post('/assignment-rules', ruleData)
      toast.success('Assignment rule created')
      await fetchAssignmentRules()
      return res.data.data
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create assignment rule'
      toast.error(msg)
      throw err
    }
  }

  const deleteAssignmentRule = async (ruleId) => {
    try {
      await api.delete(`/assignment-rules/${ruleId}`)
      toast.success('Assignment rule removed')
      await fetchAssignmentRules()
    } catch (err) {
      toast.error('Failed to delete assignment rule')
    }
  }

  useEffect(() => {
    fetchDepartments()
    fetchAllowedTargets()
  }, [fetchDepartments, fetchAllowedTargets])

  return {
    departments,
    allowedTargets,
    assignmentRules,
    loading,
    fetchDepartments,
    fetchAllowedTargets,
    fetchAssignmentRules,
    getUsersByDepartment,
    createAssignmentRule,
    deleteAssignmentRule,
  }
}
