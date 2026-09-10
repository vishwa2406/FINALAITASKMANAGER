/**
 * CONTROLLER — useTaskDetailController
 * Handles single-task fetching, delete, and AI suggestion trigger.
 */
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api'

export const useTaskDetailController = (taskId) => {
  const [task, setTask]           = useState(null)
  const [comments, setComments]   = useState([])
  const [history, setHistory]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [aiLoading, setAiLoading] = useState(false)
  const navigate = useNavigate()

  const fetchTask = async () => {
    try {
      const { data } = await api.get(`/tasks/${taskId}`)
      setTask(data.data)
    } catch {
      toast.error('Task not found')
      navigate('/tasks')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    try {
      const { data } = await api.get(`/tasks/${taskId}/comments`)
      setComments(data.data || [])
    } catch {
      console.error('Failed to fetch comments')
    }
  }

  const fetchHistory = async () => {
    try {
      const { data } = await api.get(`/tasks/${taskId}/history`)
      setHistory(data.data || [])
    } catch {
      console.error('Failed to fetch task history')
    }
  }

  useEffect(() => {
    if (taskId) {
      fetchTask()
      fetchComments()
      fetchHistory()
    }
  }, [taskId]) // eslint-disable-line

  const addComment = async (commentText) => {
    if (!commentText.trim()) return
    try {
      const { data } = await api.post(`/tasks/${taskId}/comments`, { comment: commentText })
      toast.success('Comment posted')
      setComments(prev => [...prev, data.data])
      fetchHistory()
      return data.data
    } catch {
      toast.error('Failed to post comment')
    }
  }

  const submitForReview = async (comment = '') => {
    try {
      const { data } = await api.patch(`/tasks/${taskId}/submit-review`, { comment })
      toast.success('Task submitted for completion review')
      setTask(data.data)
      fetchHistory()
      fetchComments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit for review')
    }
  }

  const approveTask = async (comment = '') => {
    try {
      const { data } = await api.patch(`/tasks/${taskId}/approve`, { comment })
      toast.success('Task completion approved! Status updated to COMPLETED.')
      setTask(data.data)
      fetchHistory()
      fetchComments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Only task creator or department manager can approve completion')
    }
  }

  const rejectTask = async (comment = '') => {
    try {
      const { data } = await api.patch(`/tasks/${taskId}/reject`, { comment })
      toast.success('Task completion rejected')
      setTask(data.data)
      fetchHistory()
      fetchComments()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject task')
    }
  }

  const deleteTask = async () => {
    if (!window.confirm('Delete this task permanently?')) return
    try {
      await api.delete(`/tasks/${taskId}`)
      toast.success('Task deleted')
      navigate('/tasks')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const getAiSuggestion = async () => {
    setAiLoading(true)
    try {
      const { data } = await api.post(`/ai/tasks/${taskId}/suggest`)
      setTask(data.data)
      toast.success('AI suggestion ready!')
    } catch {
      toast.error('AI unavailable — check your OpenAI API key')
    } finally {
      setAiLoading(false)
    }
  }

  return {
    task, comments, history, loading, aiLoading,
    fetchTask, fetchComments, fetchHistory, addComment,
    submitForReview, approveTask, rejectTask, deleteTask, getAiSuggestion,
  }
}
