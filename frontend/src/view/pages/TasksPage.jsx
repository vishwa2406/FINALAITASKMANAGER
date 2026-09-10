import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiPlus, FiSearch, FiFilter, FiEdit2, FiTrash2, FiEye,
  FiChevronLeft, FiChevronRight, FiX, FiCheckSquare, FiAlertCircle,
  FiInbox, FiSend, FiClock, FiGrid, FiBriefcase, FiCheck, FiXCircle
} from 'react-icons/fi'
import { useTaskController } from '../../controller/hooks/useTaskController'
import { StatusBadge, PriorityBadge, AiBadge } from '../components/common/Badge'
import { PageSpinner } from '../components/common/Spinner'
import TaskFormModal from '../components/tasks/TaskFormModal'
import { TASK_STATUS, TASK_STATUS_LABELS, TASK_PRIORITY, TASK_PRIORITY_LABELS, SORT_OPTIONS } from '../../model/taskModel'
import { getDepartmentBadge } from '../../model/departmentModel'

export default function TasksPage() {
  const ctrl = useTaskController('INCOMING')
  const [showFilters, setShowFilters] = useState(false)
  const [showModal,   setShowModal]   = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deletingId,  setDeletingId]  = useState(null)

  const handleSubmit = async (formData, isEditing) => {
    if (isEditing) await ctrl.updateTask(editingTask.id, formData)
    else           await ctrl.createTask(formData)
    setShowModal(false)
    setEditingTask(null)
  }

  const handleEdit = (task) => { setEditingTask(task); setShowModal(true) }

  const handleDelete = async (id) => {
    setDeletingId(id)
    await ctrl.deleteTask(id)
    setDeletingId(null)
  }

  const tabs = [
    { id: 'INCOMING',       label: 'Incoming Tasks',       icon: FiInbox, count: null },
    { id: 'OUTGOING',       label: 'Outgoing Tasks',       icon: FiSend,  count: null },
    { id: 'WAITING_REVIEW', label: 'Waiting Approval',     icon: FiClock, count: null },
    { id: 'DEPARTMENT',     label: 'Department Portal',   icon: FiBriefcase, count: null },
    { id: 'ALL',            label: 'All Tasks',            icon: FiGrid,  count: null },
  ]

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Task Management Portal</h1>
          <p className="text-gray-500 text-sm mt-0.5">{ctrl.pagination.totalElements} tasks in view</p>
        </div>
        <button onClick={() => { setEditingTask(null); setShowModal(true) }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
          <FiPlus size={16} /> New / Assign Task
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 overflow-x-auto pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = ctrl.activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => { ctrl.setActiveTab(tab.id); ctrl.setPage(0); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                isActive
                  ? 'border-blue-600 text-blue-600 font-semibold'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Search & Filter bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input value={ctrl.searchTerm} onChange={e => { ctrl.setSearchTerm(e.target.value); ctrl.setPage(0) }}
              placeholder="Search by title, description, department..."
              className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {ctrl.searchTerm && (
              <button onClick={() => ctrl.setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <FiX size={14} />
              </button>
            )}
          </div>
          <button onClick={() => setShowFilters(p => !p)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors ${showFilters || ctrl.hasFilters() ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
            <FiFilter size={16} /> Filters {ctrl.hasFilters() && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
            <select value={ctrl.filters.status} onChange={e => ctrl.updateFilter('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              {Object.values(TASK_STATUS).map(s => <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>)}
            </select>
            <select value={ctrl.filters.priority} onChange={e => ctrl.updateFilter('priority', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Priorities</option>
              {Object.values(TASK_PRIORITY).map(p => <option key={p} value={p}>{TASK_PRIORITY_LABELS[p]}</option>)}
            </select>
            <select value={ctrl.filters.sortBy} onChange={e => ctrl.updateFilter('sortBy', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>Sort: {o.label}</option>)}
            </select>
            <div className="flex gap-2">
              <select value={ctrl.filters.sortDirection} onChange={e => ctrl.updateFilter('sortDirection', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
              {ctrl.hasFilters() && (
                <button onClick={ctrl.clearFilters} className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 border border-red-200 rounded-lg">Clear</button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Task list */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {ctrl.loading ? <PageSpinner /> : ctrl.tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-56 text-gray-400">
            <FiCheckSquare size={44} className="mb-3 opacity-30" />
            <p className="font-semibold text-gray-700">No tasks in this view</p>
            <p className="text-sm text-gray-500 mt-1">{ctrl.hasFilters() ? 'Try clearing filters' : 'Select another tab or create a new task.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {ctrl.tasks.map(task => {
              const srcBadge = getDepartmentBadge(task.createdByDepartmentName)
              const tgtBadge = getDepartmentBadge(task.assignedToDepartmentName)

              return (
                <div key={task.id} className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-gray-50/80 gap-3 group transition-colors ${task.isOverdue ? 'border-l-4 border-red-500' : ''}`}>
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Top line: Department routing badges */}
                    <div className="flex items-center gap-2 text-xs flex-wrap">
                      <span className={`px-2 py-0.5 rounded font-medium ${srcBadge.bg} ${srcBadge.text}`}>
                        From: {task.createdByDepartmentName || 'Unknown'}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className={`px-2 py-0.5 rounded font-medium ${tgtBadge.bg} ${tgtBadge.text}`}>
                        To: {task.assignedToDepartmentName || 'General'}
                      </span>

                      {task.assignedToUserName && (
                        <span className="text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          Assignee: {task.assignedToUserName}
                        </span>
                      )}
                    </div>

                    {/* Title and Badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link to={`/tasks/${task.id}`} className="font-semibold text-gray-900 hover:text-blue-600 text-base leading-snug truncate">
                        {task.title}
                      </Link>
                      <StatusBadge status={task.status} />
                      <PriorityBadge priority={task.priority} />
                      {task.isOverdue && <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded font-medium"><FiAlertCircle size={12}/> Overdue</span>}
                      {task.aiAnalyzed && <AiBadge />}
                    </div>

                    {/* Category & Details */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      {task.category && <span>Category: <strong>{task.category}</strong></span>}
                      {task.dueDate  && <span>Due Date: <strong>{task.dueDate}</strong></span>}
                      {task.createdByUserName && <span>Created By: <strong>{task.createdByUserName}</strong></span>}
                    </div>
                  </div>

                  {/* Actions / Workflow Buttons */}
                  <div className="flex items-center gap-2 flex-wrap justify-end pt-2 sm:pt-0">
                    {/* Workflow: Submit for Review button */}
                    {task.status === 'IN_PROGRESS' && task.canSubmit && (
                      <button onClick={() => ctrl.submitForReview(task.id)}
                        className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm">
                        <FiSend size={13} /> Submit Review
                      </button>
                    )}

                    {/* Workflow: Approve / Reject buttons (Creator only) */}
                    {task.status === 'SUBMITTED_FOR_REVIEW' && task.canApprove && (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => ctrl.approveTask(task.id)}
                          className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                          title="Approve Completion">
                          <FiCheck size={13} /> Approve
                        </button>
                        <button onClick={() => ctrl.rejectTask(task.id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 shadow-sm"
                          title="Reject Completion">
                          <FiXCircle size={13} /> Reject
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1">
                      <Link to={`/tasks/${task.id}`} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="View Details"><FiEye size={16} /></Link>
                      <button onClick={() => handleEdit(task)} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Edit"><FiEdit2 size={16} /></button>
                      <button onClick={() => handleDelete(task.id)} disabled={deletingId === task.id}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Delete">
                        {deletingId === task.id
                          ? <div className="w-3 h-3 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                          : <FiTrash2 size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Pagination */}
        {ctrl.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {ctrl.pagination.currentPage + 1} of {ctrl.pagination.totalPages} ({ctrl.pagination.totalElements} tasks)</p>
            <div className="flex gap-2">
              <button onClick={() => ctrl.setPage(p => p - 1)} disabled={ctrl.page === 0}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"><FiChevronLeft size={16} /></button>
              <button onClick={() => ctrl.setPage(p => p + 1)} disabled={ctrl.page >= ctrl.pagination.totalPages - 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"><FiChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <TaskFormModal task={editingTask} onClose={() => { setShowModal(false); setEditingTask(null) }} onSubmit={handleSubmit} />
      )}
    </div>
  )
}
