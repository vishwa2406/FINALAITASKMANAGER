import React, { useState } from 'react'
import {
  FiShield,
  FiActivity,
  FiUsers,
  FiPieChart,
  FiRefreshCw,
  FiBriefcase,
  FiLock
} from 'react-icons/fi'
import { useAuth } from '../../controller/context/AuthContext'
import { useAdminController } from '../../controller/hooks/useAdminController'
import AdminStatsCards from '../components/admin/AdminStatsCards'
import ActivityLogTable from '../components/admin/ActivityLogTable'
import UserManagementTable from '../components/admin/UserManagementTable'
import AdminRulesPage from './AdminRulesPage'
import Spinner from '../components/common/Spinner'

export default function AdminDashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')

  const {
    loading,
    refreshing,
    stats,
    activities,
    activityPageInfo,
    activityFilter,
    users,
    userPageInfo,
    userSearch,
    setUserSearch,
    userPage,
    setUserPage,
    handleRefresh,
    updateActivityFilter,
    changeActivityPage,
    updateUserRole,
    toggleUserStatus,
  } = useAdminController()

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-2xl p-8 border border-gray-100 text-center shadow-sm max-w-xl mx-auto my-12">
        <FiLock size={56} className="text-red-500 mb-4 animate-bounce" />
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500 text-sm mt-2 max-w-md">
          You do not have administrative permissions to view system activity logs or manage users. Contact system administrator if you require access.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <Spinner />
        <p className="text-sm font-medium text-gray-500 mt-4">Loading Admin Control Panel & Activity Analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold uppercase tracking-wider border border-purple-500/30">
              Admin Governance Center
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold">
              Live Auditing Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <FiShield className="text-purple-400" /> Admin Activity Control Panel
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Monitor real-time system activities, inspect user logs, analyze task metrics, and manage user roles & access permissions.
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold rounded-xl text-xs flex items-center gap-2 transition-all shadow-sm"
        >
          <FiRefreshCw className={refreshing ? 'animate-spin' : ''} size={15} />
          {refreshing ? 'Refreshing...' : 'Refresh Metrics'}
        </button>
      </div>

      {/* Tab Navigation Bar */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FiPieChart size={15} /> System Overview
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'activity'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FiActivity size={15} /> Live Activity Audit Feed ({activityPageInfo.totalElements})
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FiUsers size={15} /> User Directory & Roles ({userPageInfo.totalElements})
        </button>

        <button
          onClick={() => setActiveTab('rules')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === 'rules'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <FiBriefcase size={15} /> Department Rules
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <AdminStatsCards stats={stats} />
          <ActivityLogTable
            activities={activities.slice(0, 8)}
            pageInfo={activityPageInfo}
            filter={activityFilter}
            onUpdateFilter={updateActivityFilter}
            onPageChange={changeActivityPage}
          />
        </div>
      )}

      {activeTab === 'activity' && (
        <ActivityLogTable
          activities={activities}
          pageInfo={activityPageInfo}
          filter={activityFilter}
          onUpdateFilter={updateActivityFilter}
          onPageChange={changeActivityPage}
        />
      )}

      {activeTab === 'users' && (
        <UserManagementTable
          users={users}
          pageInfo={userPageInfo}
          search={userSearch}
          onSearchChange={(searchVal) => {
            setUserSearch(searchVal)
            setUserPage(0)
          }}
          onPageChange={(p) => setUserPage(p)}
          onUpdateRole={updateUserRole}
          onToggleStatus={toggleUserStatus}
        />
      )}

      {activeTab === 'rules' && <AdminRulesPage />}
    </div>
  )
}
