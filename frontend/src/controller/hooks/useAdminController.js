import { useState, useEffect, useCallback } from 'react'
import api from '../api'
import toast from 'react-hot-toast'
import { DEFAULT_ACTIVITY_FILTER } from '../../model/adminModel'

/**
 * ============================================================
 * FRONTEND — CONTROLLER LAYER — Admin Controller Hook
 * ============================================================
 * Manages admin state, activity audit logs, overview analytics,
 * and user role/status management.
 * ============================================================
 */
export function useAdminController() {
  const [activities, setActivities]         = useState([])
  const [activityPageInfo, setActivityPage] = useState({ currentPage: 0, totalPages: 1, totalElements: 0 })
  const [activityFilter, setActivityFilter] = useState(DEFAULT_ACTIVITY_FILTER)
  
  const [stats, setStats]                   = useState(null)
  const [users, setUsers]                   = useState([])
  const [userPageInfo, setUserPageInfo]     = useState({ currentPage: 0, totalPages: 1, totalElements: 0 })
  const [userSearch, setUserSearch]         = useState('')
  const [userPage, setUserPage]             = useState(0)

  const [loading, setLoading]               = useState(true)
  const [refreshing, setRefreshing]         = useState(false)

  // Fetch System Overview Stats
  const fetchOverviewStats = useCallback(async () => {
    try {
      const res = await api.get('/admin/stats/overview')
      if (res.data?.success) {
        setStats(res.data.data)
      }
    } catch (err) {
      console.error('Failed to fetch admin stats', err)
    }
  }, [])

  // Fetch Activity Logs
  const fetchActivities = useCallback(async (filter = activityFilter) => {
    try {
      const params = {}
      if (filter.category) params.category = filter.category
      if (filter.userEmail) params.userEmail = filter.userEmail
      if (filter.search) params.search = filter.search
      params.page = filter.page
      params.size = filter.size

      const res = await api.get('/admin/activities', { params })
      if (res.data?.success && res.data.data) {
        setActivities(res.data.data.content || [])
        setActivityPage({
          currentPage: res.data.data.number || 0,
          totalPages: res.data.data.totalPages || 1,
          totalElements: res.data.data.totalElements || 0,
        })
      }
    } catch (err) {
      console.error('Failed to fetch activity logs', err)
      toast.error('Failed to load activity log feed')
    }
  }, [activityFilter])

  // Fetch Users List
  const fetchUsers = useCallback(async (page = userPage, search = userSearch) => {
    try {
      const params = { page, size: 10 }
      if (search) params.search = search

      const res = await api.get('/admin/users', { params })
      if (res.data?.success && res.data.data) {
        setUsers(res.data.data.content || [])
        setUserPageInfo({
          currentPage: res.data.data.number || 0,
          totalPages: res.data.data.totalPages || 1,
          totalElements: res.data.data.totalElements || 0,
        })
      }
    } catch (err) {
      console.error('Failed to fetch users list', err)
    }
  }, [userPage, userSearch])

  // Initial Load
  const loadAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchOverviewStats(), fetchActivities(), fetchUsers()])
    setLoading(false)
  }, [fetchOverviewStats, fetchActivities, fetchUsers])

  useEffect(() => {
    loadAll()
  }, [loadAll])

  // Refresh data trigger
  const handleRefresh = async () => {
    setRefreshing(true)
    await loadAll()
    setRefreshing(false)
    toast.success('Admin dashboard refreshed')
  }

  // Update Activity Filter
  const updateActivityFilter = (newFilter) => {
    const updated = { ...activityFilter, ...newFilter, page: 0 }
    setActivityFilter(updated)
    fetchActivities(updated)
  }

  // Change Activity Page
  const changeActivityPage = (newPage) => {
    const updated = { ...activityFilter, page: newPage }
    setActivityFilter(updated)
    fetchActivities(updated)
  }

  // Update User Role
  const updateUserRole = async (userId, newRole) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole })
      if (res.data?.success) {
        toast.success(`User role updated to ${newRole}`)
        fetchUsers()
        fetchOverviewStats()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user role')
    }
  }

  // Toggle User Status
  const toggleUserStatus = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`)
      if (res.data?.success) {
        toast.success('User account status updated')
        fetchUsers()
        fetchOverviewStats()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status')
    }
  }

  return {
    loading,
    refreshing,
    stats,
    activities,
    activityPageInfo,
    activityFilter,
    users,
    userPageInfo,
    userSearch,
    setUserSearch,
    userPage,
    setUserPage,
    handleRefresh,
    updateActivityFilter,
    changeActivityPage,
    updateUserRole,
    toggleUserStatus,
    fetchUsers,
  }
}
