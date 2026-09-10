import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './controller/context/AuthContext'

// View — Pages
import LoginPage      from './view/pages/LoginPage'
import RegisterPage   from './view/pages/RegisterPage'
import DashboardPage  from './view/pages/DashboardPage'
import TasksPage      from './view/pages/TasksPage'
import TaskDetailPage from './view/pages/TaskDetailPage'
import AiPage         from './view/pages/AiPage'
import ProfilePage    from './view/pages/ProfilePage'
import AdminRulesPage from './view/pages/AdminRulesPage'
import AdminDashboardPage from './view/pages/AdminDashboardPage'

// View — Layout
import MainLayout from './view/components/layout/MainLayout'

// Model — route constants
import { ROUTES } from './model/taskModel'

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to={ROUTES.LOGIN} replace />
}

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth()
  return !isAuthenticated ? children : <Navigate to={ROUTES.DASHBOARD} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

      <Route path={ROUTES.LOGIN}    element={<PublicRoute><LoginPage    /></PublicRoute>} />
      <Route path={ROUTES.REGISTER} element={<PublicRoute><RegisterPage /></PublicRoute>} />

      <Route path="/" element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="dashboard"   element={<DashboardPage  />} />
        <Route path="tasks"       element={<TasksPage      />} />
        <Route path="tasks/:id"   element={<TaskDetailPage />} />
        <Route path="ai"          element={<AiPage         />} />
        <Route path="profile"     element={<ProfilePage    />} />
        <Route path="admin"       element={<AdminDashboardPage />} />
        <Route path="admin/rules" element={<AdminRulesPage />} />
      </Route>

      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-200">404</h1>
            <p className="text-gray-500 mt-2">Page not found</p>
            <a href="/dashboard" className="mt-4 inline-block text-blue-500 hover:underline text-sm">Go to Dashboard</a>
          </div>
        </div>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: { background: '#1e293b', color: '#f8fafc', borderRadius: '8px', fontSize: '14px' },
        success: { iconTheme: { primary: '#22c55e', secondary: '#f8fafc' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#f8fafc' } },
      }} />
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </>
  )
}
