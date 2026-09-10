import React from 'react'
import {
  FiUsers,
  FiSearch,
  FiCheckCircle,
  FiXCircle,
  FiChevronLeft,
  FiChevronRight,
  FiBriefcase,
  FiShield,
  FiUserCheck
} from 'react-icons/fi'
import { SYSTEM_ROLES } from '../../../model/adminModel'

export default function UserManagementTable({
  users,
  pageInfo,
  search,
  onSearchChange,
  onPageChange,
  onUpdateRole,
  onToggleStatus
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden space-y-4">
      {/* Header & Search */}
      <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex flex-wrap gap-3 items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <FiUsers className="text-blue-600" /> User Directory & Role Management
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage system users, assign administrative roles, and activate/deactivate accounts.
          </p>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <FiSearch className="absolute left-3 top-2.5 text-gray-400" size={14} />
          <input
            type="text"
            placeholder="Search name or email..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider border-b border-gray-100">
            <tr>
              <th className="px-5 py-3">User Details</th>
              <th className="px-5 py-3">Department</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Tasks (Created / Assigned)</th>
              <th className="px-5 py-3">Account Status</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400 text-sm">
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                        {u.fullName?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold text-gray-900 block">{u.fullName}</span>
                        <span className="text-[11px] text-gray-400 block">{u.email}</span>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 text-[11px] font-medium">
                      <FiBriefcase size={12} className="text-gray-500" />
                      {u.departmentName || 'IT'} ({u.departmentCode || 'IT'})
                    </span>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    <select
                      value={u.role}
                      onChange={(e) => onUpdateRole(u.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer ${
                        u.role === 'ADMIN' || u.role === 'SUPER_ADMIN'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : u.role === 'MANAGER'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-gray-50 text-gray-700 border-gray-200'
                      }`}
                    >
                      {SYSTEM_ROLES.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap font-medium text-gray-700">
                    <span className="text-blue-600 font-bold">{u.totalTasksCreated}</span> created /{' '}
                    <span className="text-purple-600 font-bold">{u.totalTasksAssigned}</span> assigned
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap">
                    {u.active ? (
                      <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200 font-semibold text-[11px]">
                        <FiCheckCircle size={12} /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 px-2.5 py-1 rounded-full border border-red-200 font-semibold text-[11px]">
                        <FiXCircle size={12} /> Suspended
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => onToggleStatus(u.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                        u.active
                          ? 'bg-red-50 hover:bg-red-100 text-red-600'
                          : 'bg-green-50 hover:bg-green-100 text-green-700'
                      }`}
                    >
                      {u.active ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span>
          Page <b>{pageInfo.currentPage + 1}</b> of <b>{pageInfo.totalPages}</b> ({pageInfo.totalElements} users)
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
