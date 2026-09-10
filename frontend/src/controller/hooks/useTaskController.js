/**
 * ============================================================
 * CONTROLLER LAYER — useTaskController hook
 * ============================================================
 * All task logic in one place:
 *  • Fetching with search/filter/pagination
 *  • CRUD operations
 *  • State management (tasks list, pagination, loading)
 *
 * TasksPage (View) calls this hook — no axios in the View.
 * ============================================================
 */
import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import api from '../api'
import { DEFAULT_PAGE_SIZE, EMPTY_TASK_FORM } from '../../model/taskModel'

export const useTaskController = (initialTab = 'INCOMING') => {
  const [tasks, setTasks]           = useState([])
  const [pagination, setPagination] = useState({ currentPage: 0, totalPages: 0, totalElements: 0 })
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState(initialTab)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters]       = useState({ status: '', priority: '', category: '', sortBy: 'createdAt', sortDirection: 'DESC' })
  const [page, setPage]             = useState(0)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, size: DEFAULT_PAGE_SIZE, viewType: activeTab, ...filters }
      if (searchTerm) params.searchTerm = searchTerm
      Object.keys(params).forEach(k => params[k] === '' && delete params[k])
      const { data } = await api.get('/tasks', { params })
      setTasks(data.data.tasks)
      setPagination({
        currentPage:   data.data.currentPage,
        totalPages:    data.data.totalPages,
        totalElements: data.data.totalElements,
      })
    } catch {
      toast.error('Failed to fetch tasks')
    } finally {
      setLoading(false)
    }
  }, [page, filters, searchTerm, activeTab])

  useEffect(() => { fetchTasks() }, [fetchTasks])

  const createTask = async (formData) => {
    const payload = {
      ...formData,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
      actualHours:    formData.actualHours    ? parseFloat(formData.actualHours)    : null,
      dueDate:        formData.dueDate || null,
      assignedToDepartmentId: formData.assignedToDepartmentId ? parseInt(formData.assignedToDepartmentId) : null,
      assignedToUserId:       formData.assignedToUserId ? parseInt(formData.assignedToUserId) : null,
    }
    await api.post('/tasks', payload)
    toast.success('Task created successfully!')
    fetchTasks()
  }

  const updateTask = async (id, formData) => {
    const payload = {
      ...formData,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
      actualHours:    formData.actualHours    ? parseFloat(formData.actualHours)    : null,
      dueDate:        formData.dueDate || null,
      assignedToDepartmentId: formData.assignedToDepartmentId ? parseInt(formData.assignedToDepartmentId) : null,
      assignedToUserId:       formData.assignedToUserId ? parseInt(formData.assignedToUserId) : null,
    }
    await api.put(`/tasks/${id}`, payload)
    toast.success('Task updated!')
    fetchTasks()
  }

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/tasks/${id}/status`, { status })
      toast.success('Status updated')
      fetchTasks()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status'
      toast.error(msg)
    }
  }

  const submitForReview = async (id, comment = '') => {
    try {
      await api.patch(`/tasks/${id}/submit-review`, { comment })
      toast.success('Task submitted for review')
      fetchTasks()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit task for review'
      toast.error(msg)
    }
  }

  const approveTask = async (id, comment = '') => {
    try {
      await api.patch(`/tasks/${id}/approve`, { comment })
      toast.success('Task completion approved! Status updated to COMPLETED.')
      fetchTasks()
    } catch (err) {
      const msg = err.response?.data?.message || 'Only task creator or department manager can approve completion'
      toast.error(msg)
    }
  }

  const rejectTask = async (id, comment = '') => {
    try {
      await api.patch(`/tasks/${id}/reject`, { comment })
      toast.success('Task completion rejected')
      fetchTasks()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reject completion'
      toast.error(msg)
    }
  }

  const deleteTask = async (id) => {
    if (!window.confirm('Delete this task?')) return false
    try {
      await api.delete(`/tasks/${id}`)
      toast.success('Task deleted')
      fetchTasks()
      return true
    } catch {
      toast.error('Failed to delete task')
      return false
    }
  }

  const updateFilter  = (key, value) => { setFilters(p => ({ ...p, [key]: value })); setPage(0) }
  const clearFilters  = () => { setFilters({ status: '', priority: '', category: '', sortBy: 'createdAt', sortDirection: 'DESC' }); setSearchTerm(''); setPage(0) }
  const hasFilters    = () => Object.values(filters).some((v, i) => i < 3 && v !== '') || !!searchTerm

  return {
    tasks, pagination, loading, activeTab, searchTerm, filters, page,
    setActiveTab, setSearchTerm, setPage, updateFilter, clearFilters, hasFilters,
    fetchTasks, createTask, updateTask, updateStatus, submitForReview, approveTask, rejectTask, deleteTask,
  }
}
