import React from 'react'
import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { FiCheckSquare, FiClock, FiAlertCircle, FiTrendingUp, FiPlus, FiArrowRight, FiCpu } from 'react-icons/fi'
import { useAuth } from '../../controller/context/AuthContext'
import { useDashboardController } from '../../controller/hooks/useDashboardController'
import { PageSpinner } from '../components/common/Spinner'
import { TASK_STATUS_COLORS } from '../../model/taskModel'

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="text-white" size={22} />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  </div>
)

export default function DashboardPage() {
  const { user }          = useAuth()
  const { stats, loading } = useDashboardController()

  if (loading) return <PageSpinner />

  const greeting = () => {
    const h = new Date().getHours()
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }

  const pieData = stats ? [
    { name: 'To Do',       value: stats.todo,       color: TASK_STATUS_COLORS.TODO.hex       },
    { name: 'In Progress', value: stats.inProgress,  color: TASK_STATUS_COLORS.IN_PROGRESS.hex },
    { name: 'Completed',   value: stats.completed,   color: TASK_STATUS_COLORS.COMPLETED.hex   },
    { name: 'Cancelled',   value: stats.cancelled,   color: TASK_STATUS_COLORS.CANCELLED.hex   },
  ].filter(d => d.value > 0) : []

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
              Dept: {user?.departmentName || 'IT'} ({user?.departmentCode || 'IT'})
            </span>
            <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
              Role: {user?.role || 'USER'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{greeting()}, {user?.fullName?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm">Cross-department task management dashboard</p>
        </div>
        <Link to="/tasks" className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          <FiPlus size={16} /> New / Assign Task
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <StatCard icon={FiCheckSquare} label="Incoming"  value={stats.incomingCount || 0}   color="bg-blue-600"   sub="Assigned to Me / Dept" />
          <StatCard icon={FiTrendingUp}  label="Outgoing"    value={stats.outgoingCount || 0}   color="bg-purple-600" sub="Assigned to Others" />
          <StatCard icon={FiClock}       label="For Review"  value={stats.waitingReviewCount || 0} color="bg-amber-600" sub="Waiting Approval" />
          <StatCard icon={FiCheckSquare} label="Completed"   value={stats.completed}           color="bg-green-600"  sub={`${stats.completionRate}% rate`} />
          <StatCard icon={FiClock}       label="In Progress" value={stats.inProgress}          color="bg-indigo-600" sub="Active Tasks" />
          <StatCard icon={FiAlertCircle} label="Overdue"     value={stats.overdue?.length || 0} color="bg-red-600"    sub="Attention Needed" />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Tasks by Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-gray-400">
              <FiCheckSquare size={40} className="mb-2 opacity-30" />
              <p className="text-sm">No tasks yet</p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Task Summary</h3>
          {stats?.total > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={[
                { name: 'Todo',       count: stats.todo,       fill: TASK_STATUS_COLORS.TODO.hex       },
                { name: 'In Prog',    count: stats.inProgress, fill: TASK_STATUS_COLORS.IN_PROGRESS.hex },
                { name: 'Done',       count: stats.completed,  fill: TASK_STATUS_COLORS.COMPLETED.hex   },
                { name: 'Cancelled',  count: stats.cancelled,  fill: TASK_STATUS_COLORS.CANCELLED.hex   },
              ]}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {[TASK_STATUS_COLORS.TODO.hex, TASK_STATUS_COLORS.IN_PROGRESS.hex, TASK_STATUS_COLORS.COMPLETED.hex, TASK_STATUS_COLORS.CANCELLED.hex].map((c, i) => (
                    <Cell key={i} fill={c} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-gray-400 text-sm">Create tasks to see charts</div>
          )}
        </div>
      </div>

      {/* Due Soon + Overdue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Due This Week</h3>
            <Link to="/tasks" className="text-sm text-blue-600 hover:underline flex items-center gap-1">View all <FiArrowRight size={14} /></Link>
          </div>
          {stats?.dueSoon?.length > 0 ? (
            <div className="space-y-2">
              {stats.dueSoon.slice(0,5).map(t => (
                <Link key={t.id} to={`/tasks/${t.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-blue-600">{t.title}</p>
                    <p className="text-xs text-gray-400">{t.dueDate}</p>
                  </div>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${
                    t.priority === 'URGENT' ? 'bg-red-100 text-red-700' : t.priority === 'HIGH' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}>{t.priority}</span>
                </Link>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-8">No tasks due this week 🎉</p>}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              Overdue Tasks
              {stats?.overdue?.length > 0 && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{stats.overdue.length}</span>}
            </h3>
          </div>
          {stats?.overdue?.length > 0 ? (
            <div className="space-y-2">
              {stats.overdue.slice(0,5).map(t => (
                <Link key={t.id} to={`/tasks/${t.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50 group border border-red-100">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate group-hover:text-red-600">{t.title}</p>
                    <p className="text-xs text-red-400">Due: {t.dueDate}</p>
                  </div>
                  <FiAlertCircle className="text-red-400 flex-shrink-0 ml-2" size={16} />
                </Link>
              ))}
            </div>
          ) : <p className="text-sm text-gray-400 text-center py-8">No overdue tasks! Great job ✅</p>}
        </div>
      </div>

      {/* AI CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <FiCpu className="text-white" size={24} />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">Try AI Productivity Analysis</h3>
            <p className="text-blue-200 text-sm">Get personalized insights powered by GPT</p>
          </div>
        </div>
        <Link to="/ai" className="px-5 py-2.5 bg-white text-blue-700 font-semibold rounded-lg hover:bg-blue-50 transition-colors text-sm whitespace-nowrap flex-shrink-0">
          Analyze Now →
        </Link>
      </div>
    </div>
  )
}
