/**
 * VIEW — Badge
 * Reusable status/priority badge purely driven by Model color maps.
 */
import React from 'react'
import { TASK_STATUS_COLORS, TASK_STATUS_LABELS, TASK_PRIORITY_COLORS, TASK_PRIORITY_LABELS } from '../../../model/taskModel'

export const StatusBadge = ({ status }) => {
  const c = TASK_STATUS_COLORS[status] || { bg: 'bg-gray-100', text: 'text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {TASK_STATUS_LABELS[status] || status}
    </span>
  )
}

export const PriorityBadge = ({ priority }) => {
  const c = TASK_PRIORITY_COLORS[priority] || { bg: 'bg-gray-100', text: 'text-gray-600' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {TASK_PRIORITY_LABELS[priority] || priority}
    </span>
  )
}

export const AiBadge = () => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
    ✦ AI
  </span>
)
