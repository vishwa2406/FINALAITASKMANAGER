import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  FiArrowLeft, FiEdit2, FiTrash2, FiCpu, FiClock, FiCalendar,
  FiTag, FiFolder, FiAlertCircle, FiLoader, FiSend, FiCheck,
  FiXCircle, FiMessageSquare, FiActivity, FiUser, FiBriefcase
} from 'react-icons/fi'
import { useTaskDetailController } from '../../controller/hooks/useTaskDetailController'
import { StatusBadge, PriorityBadge, AiBadge } from '../components/common/Badge'
import { PageSpinner } from '../components/common/Spinner'
import TaskFormModal from '../components/tasks/TaskFormModal'
import { getDepartmentBadge } from '../../model/departmentModel'

export default function TaskDetailPage() {
  const { id } = useParams()
  const {
    task, comments, history, loading, aiLoading,
    fetchTask, addComment, submitForReview, approveTask, rejectTask, deleteTask, getAiSuggestion
  } = useTaskDetailController(id)

  const [showEdit, setShowEdit]       = useState(false)
  const [commentText, setCommentText] = useState('')
  const [actionComment, setActionComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)

  const handleEditSubmit = async (formData) => {
    try {
      await fetchTask()
      setShowEdit(false)
    } catch {
      console.error('Failed to refresh task after edit')
    }
  }

  const handlePostComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim()) return
    setSubmittingComment(true)
    await addComment(commentText)
    setCommentText('')
    setSubmittingComment(false)
  }

  if (loading) return <PageSpinner />
  if (!task)   return null

  const srcBadge = getDepartmentBadge(task.createdByDepartmentName)
  const tgtBadge = getDepartmentBadge(task.assignedToDepartmentName)

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in pb-10">
      <Link to="/tasks" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 font-medium">
        <FiArrowLeft size={16} /> Back to Tasks Portal
      </Link>

      {/* Main Header & Title Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className={`p-6 border-l-4 ${task.isOverdue ? 'border-red-500 bg-red-50/20' : 'border-blue-600'}`}>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-2">
              {/* Department Routing Badges */}
              <div className="flex items-center gap-2 text-xs flex-wrap">
                <span className={`px-2.5 py-1 rounded-md font-semibold ${srcBadge.bg} ${srcBadge.text}`}>
                  Assigned From: {task.createdByDepartmentName || 'General'} ({task.createdByUserName || 'User'})
                </span>
                <span className="text-gray-400 font-bold">→</span>
                <span className={`px-2.5 py-1 rounded-md font-semibold ${tgtBadge.bg} ${tgtBadge.text}`}>
                  Assigned To: {task.assignedToDepartmentName || 'General'}
                  {task.assignedToUserName ? ` (${task.assignedToUserName})` : ''}
                </span>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 leading-tight">{task.title}</h1>

              {task.isOverdue && (
                <div className="flex items-center gap-1.5 text-red-600 text-sm font-medium">
                  <FiAlertCircle size={15} /> This task is overdue!
                </div>
              )}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <button onClick={() => setShowEdit(true)} className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                <FiEdit2 size={14} /> Edit
              </button>
              <button onClick={deleteTask} className="flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-sm font-medium transition-colors">
                <FiTrash2 size={14} /> Delete
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-gray-100">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
            {task.aiAnalyzed && <AiBadge />}
          </div>
        </div>

        {/* Workflow Approval Action Panel */}
        <div className="bg-slate-50 p-4 border-t border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-gray-600">
            <strong>Current Workflow State:</strong> {task.status}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Submit for Review Action (Assignee) */}
            {task.status === 'IN_PROGRESS' && task.canSubmit && (
              <button onClick={() => submitForReview('Submitted for completion review')}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm">
                <FiSend size={15} /> Submit For Review
              </button>
            )}

            {/* Approval / Rejection Actions (Creator Only) */}
            {task.status === 'SUBMITTED_FOR_REVIEW' && task.canApprove && (
              <div className="flex items-center gap-2">
                <button onClick={() => approveTask('Approved task completion')}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm">
                  <FiCheck size={16} /> Approve Completion
                </button>
                <button onClick={() => rejectTask('Rejected task completion')}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 shadow-sm">
                  <FiXCircle size={16} /> Reject Task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {task.category && (
            <div className="flex items-start gap-3">
              <FiFolder className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
              <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Category</p><p className="text-sm font-medium text-gray-800 mt-0.5">{task.category}</p></div>
            </div>
          )}
          {task.dueDate && (
            <div className="flex items-start gap-3">
              <FiCalendar className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
              <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Due Date</p>
                <p className={`text-sm font-medium mt-0.5 ${task.isOverdue ? 'text-red-600' : 'text-gray-800'}`}>{task.dueDate}</p>
              </div>
            </div>
          )}
          {task.estimatedHours && (
            <div className="flex items-start gap-3">
              <FiClock className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
              <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Estimated Hours</p><p className="text-sm font-medium text-gray-800 mt-0.5">{task.estimatedHours}h</p></div>
            </div>
          )}
          {task.actualHours && (
            <div className="flex items-start gap-3">
              <FiClock className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
              <div><p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Actual Hours</p><p className="text-sm font-medium text-gray-800 mt-0.5">{task.actualHours}h</p></div>
            </div>
          )}
          {task.tags && (
            <div className="flex items-start gap-3 sm:col-span-2">
              <FiTag className="text-gray-400 mt-0.5 flex-shrink-0" size={16} />
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Tags</p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {task.tags.split(',').map((t, i) => <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-medium">{t.trim()}</span>)}
                </div>
              </div>
            </div>
          )}
        </div>

        {task.description && (
          <div className="px-6 pb-6 border-t border-gray-100 pt-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{task.description}</p>
          </div>
        )}
      </div>

      {/* AI Assistant Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center"><FiCpu className="text-purple-600" size={16} /></div>
            <h2 className="text-lg font-semibold text-gray-900">AI Task Analysis & Advice</h2>
          </div>
          <button onClick={getAiSuggestion} disabled={aiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-sm font-medium transition-colors">
            {aiLoading ? <><FiLoader className="animate-spin" size={14} /> Analyzing...</> : <><FiCpu size={14} /> {task.aiAnalyzed ? 'Re-Analyze' : 'Get AI Advice'}</>}
          </button>
        </div>

        {task.aiSuggestion ? (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-5 border border-purple-100">
            <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{task.aiSuggestion}</p>
          </div>
        ) : (
          <div className="text-center py-6 text-gray-400">
            <FiCpu size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Click "Get AI Advice" for automated task breakdown and recommendations.</p>
          </div>
        )}
      </div>

      {/* Grid: Discussion Comments & Audit Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Comments Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <FiMessageSquare size={18} className="text-blue-600" /> Discussion & Comments ({comments.length})
          </h2>

          <form onSubmit={handlePostComment} className="space-y-2">
            <textarea
              rows={2}
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a comment or status update..."
              className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <div className="flex justify-end">
              <button type="submit" disabled={submittingComment || !commentText.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5">
                {submittingComment ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-4">No comments yet. Start the conversation!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} className="p-3 bg-gray-50 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between items-center text-gray-500">
                    <span className="font-semibold text-gray-800">{c.userName} ({c.userEmail})</span>
                    <span>{new Date(c.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{c.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Task History Audit Trail Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
            <FiActivity size={18} className="text-purple-600" /> Audit Trail ({history.length})
          </h2>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {history.length === 0 ? (
              <p className="text-xs text-gray-400 italic text-center py-4">No audit history available.</p>
            ) : (
              history.map(h => (
                <div key={h.id} className="flex gap-3 text-xs border-l-2 border-purple-300 pl-3 py-1">
                  <div className="flex-1 space-y-0.5">
                    <div className="flex items-center justify-between text-gray-500">
                      <span className="font-semibold text-gray-800">{h.action}</span>
                      <span>{new Date(h.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-600">By: {h.performedByUserName}</p>
                    {h.comment && <p className="text-gray-500 italic bg-purple-50/50 p-1.5 rounded">{h.comment}</p>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showEdit && <TaskFormModal task={task} onClose={() => setShowEdit(false)} onSubmit={handleEditSubmit} />}
    </div>
  )
}
