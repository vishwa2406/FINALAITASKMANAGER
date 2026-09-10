import React, { useState, useEffect } from 'react'
import { FiX, FiSave, FiLoader, FiUsers, FiBriefcase } from 'react-icons/fi'
import { useTaskFormController } from '../../../controller/hooks/useTaskFormController'
import { useDepartments } from '../../../controller/hooks/useDepartments'
import { TASK_STATUS, TASK_STATUS_LABELS, TASK_PRIORITY, TASK_PRIORITY_LABELS } from '../../../model/taskModel'

/**
 * VIEW — TaskFormModal
 * Includes Target Department and Target User dropdowns based on allowed assignment rules.
 */
export default function TaskFormModal({ task, onClose, onSubmit }) {
  const { form, errors, loading, isEditing, handleChange, handleSubmit } =
    useTaskFormController(task, onSubmit)

  const { allowedTargets, getUsersByDepartment } = useDepartments()
  const [departmentUsers, setDepartmentUsers]  = useState([])
  const [loadingUsers, setLoadingUsers]        = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      if (form.assignedToDepartmentId) {
        setLoadingUsers(true)
        const users = await getUsersByDepartment(form.assignedToDepartmentId)
        setDepartmentUsers(users)
        setLoadingUsers(false)
      } else {
        setDepartmentUsers([])
      }
    }
    fetchUsers()
  }, [form.assignedToDepartmentId, getUsersByDepartment])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Task' : 'Create & Assign Task'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600">
            <FiX size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
            <input type="text" name="title" value={form.title} onChange={handleChange}
              placeholder="What needs to be done?"
              className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-400' : 'border-gray-300'}`} />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title}</p>}
          </div>

          {/* Department Assignment Section */}
          <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-3">
            <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
              <FiBriefcase size={14} /> Department Assignment
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Target Department</label>
                <select name="assignedToDepartmentId" value={form.assignedToDepartmentId} onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">Select Target Department</option>
                  {allowedTargets.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center justify-between">
                  <span>Assignee Employee</span>
                  {loadingUsers && <span className="text-blue-600 text-[10px]">Loading...</span>}
                </label>
                <select name="assignedToUserId" value={form.assignedToUserId} onChange={handleChange}
                  disabled={!form.assignedToDepartmentId || loadingUsers}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400">
                  <option value="">Whole Department / Unassigned</option>
                  {departmentUsers.map(u => (
                    <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3}
              placeholder="Add details..." className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
          </div>

          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" value={form.status} onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.values(TASK_STATUS).map(s => <option key={s} value={s}>{TASK_STATUS_LABELS[s]}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.values(TASK_PRIORITY).map(p => <option key={p} value={p}>{TASK_PRIORITY_LABELS[p]}</option>)}
              </select>
            </div>
          </div>

          {/* Category & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input type="text" name="category" value={form.category} onChange={handleChange}
                placeholder="e.g. Work, Personal" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" name="dueDate" value={form.dueDate} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
              <input type="number" name="estimatedHours" value={form.estimatedHours} onChange={handleChange}
                placeholder="e.g. 2.5" min="0" step="0.5"
                className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.estimatedHours ? 'border-red-400' : 'border-gray-300'}`} />
              {errors.estimatedHours && <p className="mt-1 text-xs text-red-500">{errors.estimatedHours}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actual Hours</label>
              <input type="number" name="actualHours" value={form.actualHours} onChange={handleChange}
                placeholder="e.g. 3" min="0" step="0.5"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
            <input type="text" name="tags" value={form.tags} onChange={handleChange}
              placeholder="e.g. api, backend, urgent"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold flex items-center justify-center gap-2">
              {loading ? <><FiLoader className="animate-spin" size={15} /> Saving...</> : <><FiSave size={15} /> {isEditing ? 'Update Task' : 'Assign Task'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
