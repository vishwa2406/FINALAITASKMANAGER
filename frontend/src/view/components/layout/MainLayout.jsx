import React, { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../../../controller/context/AuthContext'
import { ROUTES } from '../../../model/taskModel'
import { FiHome, FiCheckSquare, FiCpu, FiUser, FiLogOut, FiMenu, FiChevronRight, FiShield } from 'react-icons/fi'

const NAV = [
  { path: ROUTES.DASHBOARD, icon: FiHome,        label: 'Dashboard'    },
  { path: ROUTES.TASKS,     icon: FiCheckSquare, label: 'Tasks Portal' },
  { path: ROUTES.AI,        icon: FiCpu,         label: 'AI Assistant' },
  { path: ROUTES.PROFILE,   icon: FiUser,        label: 'Profile'      },
]

export default function MainLayout() {
  const { user, logout }         = useAuth()
  const [open, setOpen]          = useState(true)
  const [mobileOpen, setMobile]  = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setMobile(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 flex flex-col bg-slate-900 text-white transition-all duration-300
        ${open ? 'w-64' : 'w-16'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>

        {/* Brand */}
        <div className={`flex items-center h-16 px-4 border-b border-slate-700 ${!open && 'justify-center'}`}>
          <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
            <FiCpu size={18} />
          </div>
          {open && (
            <div className="ml-3 min-w-0 flex-1">
              <span className="font-bold text-base block leading-tight">AI Tasks</span>
              <span className="text-[10px] text-blue-400 font-medium block">Dept Management</span>
            </div>
          )}
          <button onClick={() => setOpen(p => !p)} className="ml-auto hidden lg:flex w-6 h-6 items-center justify-center rounded hover:bg-slate-700">
            <FiChevronRight className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`} size={14} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ path, icon: Icon, label }) => (
            <NavLink key={path} to={path} onClick={() => setMobile(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                 ${isActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                 ${!open && 'justify-center'}`}
              title={!open ? label : ''}>
              <Icon size={18} className="flex-shrink-0" />
              {open && <span className="ml-3 whitespace-nowrap">{label}</span>}
            </NavLink>
          ))}

          {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
            <NavLink to={ROUTES.ADMIN} onClick={() => setMobile(false)}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                 ${isActive ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                 ${!open && 'justify-center'}`}
              title={!open ? 'Admin Panel' : ''}>
              <FiShield size={18} className="flex-shrink-0 text-purple-300" />
              {open && <span className="ml-3 whitespace-nowrap">Admin Panel</span>}
            </NavLink>
          )}
        </nav>

        {/* User */}
        <div className="p-2 border-t border-slate-700">
          {open ? (
            <div className="flex items-center px-3 py-2 rounded-lg bg-slate-800 gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-sm font-bold flex-shrink-0">
                {user?.fullName?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.fullName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.departmentCode || 'IT'} • {user?.role}</p>
              </div>
              <button onClick={logout} className="p-1.5 rounded hover:bg-slate-700 text-slate-400 hover:text-red-400" title="Logout">
                <FiLogOut size={15} />
              </button>
            </div>
          ) : (
            <button onClick={logout} className="w-full flex justify-center p-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-red-400" title="Logout">
              <FiLogOut size={18} />
            </button>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6 gap-4 flex-shrink-0">
          <button className="lg:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobile(true)}>
            <FiMenu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
              {user?.departmentName || 'IT Department'}
            </span>
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">
              {user?.fullName?.[0]?.toUpperCase()}
            </div>
            <span className="hidden md:block text-sm font-medium text-gray-700">{user?.fullName}</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
