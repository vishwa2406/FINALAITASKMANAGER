import React from 'react'
import {
  FiSearch,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiClock,
  FiUser,
  FiLock,
  FiCheckSquare,
  FiShield,
  FiCpu,
  FiBriefcase
} from 'react-icons/fi'
import { ACTIVITY_CATEGORIES, ACTIVITY_CATEGORY_LABELS, ACTIVITY_CATEGORY_BADGES } from '../../../model/adminModel'

const getCategoryIcon = (cat) => {
  switch (cat) {
    case 'AUTH': return <FiLock size={13} />
    case 'TASK': return <FiCheckSquare size={13} />
    case 'ADMIN': return <FiShield size={13} />
    case 'AI': return <FiCpu size={13} />
    case 'DEPARTMENT': return <FiBriefcase size={13} />
    default: return <FiClock size={13} />
  }
}

export default function ActivityLogTable({
  activities,
  pageInfo,
  filter,
  onUpdateFilter,
  onPageChange
}) {
  const handleSearchChange = (e) => {
    onUpdateFilter({ search: e.target.value })
  }

  const handleCategoryChange = (e) => {
    onUpdateFilter({ category: e.target.value })
  }

  const handleUserEmailChange = (e) => {
    onUpdateFilter({ userEmail: e.target.value })
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-4">
      {/* Header & Filter Controls */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FiClock className="text-blue-600" /> Live Activity Audit Feed
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Real-time track of user logins, task lifecycle changes, admin actions, and AI requests.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Category Selector */}
          <div className="relative">
            <select
              value={filter.category || ''}
              onChange={handleCategoryChange}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg text-xs font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value={ACTIVITY_CATEGORIES.AUTH}>Security & Auth</option>
              <option value={ACTIVITY_CATEGORIES.TASK}>Task Operations</option>
              <option value={ACTIVITY_CATEGORIES.ADMIN}>Admin Actions</option>
              <option value={ACTIVITY_CATEGORIES.AI}>AI Requests</option>
            </select>
          </div>

          {/* User Email Filter */}
          <div className="relative min-w-[140px]">
            <input
              type="text"
              placeholder="Filter by email..."
              value={filter.userEmail || ''}
              onChange={handleUserEmailChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Search Box */}
          <div className="relative min-w-[180px]">
            <FiSearch className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search details/action..."
              value={filter.search || ''}
              onChange={handleSearchChange}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Activities Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Details</th>
              <th className="px-5 py-3">Timestamp</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400 text-sm">
                  No activity logs matching your current filters.
                </td>
              </tr>
            ) : (
              activities.map((act) => {
                const badge = ACTIVITY_CATEGORY_BADGES[act.actionCategory] || {
                  bg: 'bg-gray-100',
                  text: 'text-gray-700',
                }
                const formattedDate = act.createdAt
                  ? new Date(act.createdAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })
                  : 'N/A'

                return (
                  <tr key={act.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-5 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${badge.bg} ${badge.text}`}
                      >
                        {getCategoryIcon(act.actionCategory)}
                        {act.actionCategory}
                      </span>
                    </td>
                    <td className="px-5 py-3 font-semibold text-gray-900 whitespace-nowrap">
                      {act.action}
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <FiUser size={13} className="text-gray-400" />
                        <div>
                          <span className="font-medium text-gray-800 block leading-tight">
                            {act.userName || 'System'}
                          </span>
                          <span className="text-[10px] text-gray-400 block">{act.userEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-600 max-w-md truncate" title={act.details}>
                      {act.details || '—'}
                    </td>
                    <td className="px-5 py-3 text-gray-400 whitespace-nowrap">{formattedDate}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>
          Showing page <b>{pageInfo.currentPage + 1}</b> of <b>{pageInfo.totalPages}</b> ({pageInfo.totalElements} total entries)
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(pageInfo.currentPage - 1)}
            disabled={pageInfo.currentPage === 0}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <FiChevronLeft size={16} />
          </button>
          <button
            onClick={() => onPageChange(pageInfo.currentPage + 1)}
            disabled={pageInfo.currentPage >= pageInfo.totalPages - 1}
            className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            <FiChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
