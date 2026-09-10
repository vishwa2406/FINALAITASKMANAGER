import React from 'react'
import { FiUsers, FiCheckCircle, FiActivity, FiCpu, FiShield, FiAlertTriangle, FiList } from 'react-icons/fi'

export default function AdminStatsCards({ stats }) {
  if (!stats) return null

  const cards = [
    {
      title: 'Total Registered Users',
      value: stats.totalUsers || 0,
      sub: `${stats.activeUsers || 0} active, ${stats.adminUsers || 0} admins`,
      icon: FiUsers,
      color: 'from-blue-500 to-indigo-600',
      textColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Total System Tasks',
      value: stats.totalTasks || 0,
      sub: `${stats.completedTasks || 0} completed, ${stats.inProgressTasks || 0} in-progress`,
      icon: FiCheckCircle,
      color: 'from-emerald-500 to-teal-600',
      textColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
    {
      title: 'Total Audit Activities',
      value: stats.totalActivities || 0,
      sub: `${stats.activitiesToday || 0} logged today`,
      icon: FiActivity,
      color: 'from-purple-500 to-pink-600',
      textColor: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Overdue System Tasks',
      value: stats.overdueTasks || 0,
      sub: 'Tasks past deadline requiring attention',
      icon: FiAlertTriangle,
      color: 'from-amber-500 to-red-500',
      textColor: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
  ]

  const categories = stats.categoryBreakdown || {}

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">{card.title}</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{card.value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${card.bgColor} ${card.textColor}`}>
                  <Icon size={24} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4 border-t border-gray-50 pt-2 font-medium">{card.sub}</p>
            </div>
          )
        })}
      </div>

      {/* Activity Category Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FiList className="text-blue-600" /> Activity Volume Breakdown by Category
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries({
            AUTH: { label: 'Auth & Access', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            TASK: { label: 'Task Events', color: 'bg-blue-50 text-blue-700 border-blue-200' },
            ADMIN: { label: 'Admin Actions', color: 'bg-purple-50 text-purple-700 border-purple-200' },
            AI: { label: 'AI Requests', color: 'bg-amber-50 text-amber-700 border-amber-200' },
            DEPARTMENT: { label: 'Department Rules', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
          }).map(([catKey, meta]) => {
            const count = categories[catKey] || 0
            return (
              <div key={catKey} className={`p-3 rounded-xl border ${meta.color} text-center space-y-1`}>
                <span className="text-xs font-medium block">{meta.label}</span>
                <span className="text-xl font-bold block">{count}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
