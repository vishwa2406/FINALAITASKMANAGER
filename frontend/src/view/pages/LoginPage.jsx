import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff, FiCpu } from 'react-icons/fi'
import { useAuthController } from '../../controller/hooks/useAuthController'

/**
 * VIEW — LoginPage
 * Pure presentation. All logic delegated to useAuthController.
 */
export default function LoginPage() {
  const { loginForm, loginErrors, loginLoading, handleLoginChange, submitLogin } = useAuthController()
  const [showPwd, setShowPwd] = useState(false)

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full translate-x-1/2 translate-y-1/2" />
        <div className="relative z-10 text-center">
          <div className="w-20 h-20 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/40">
            <FiCpu className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">AI Task Manager</h1>
          <p className="text-blue-200 text-lg mb-10 max-w-sm">Supercharge productivity with AI-powered task management.</p>
          <div className="space-y-3 text-left max-w-sm mx-auto">
            {['🤖 AI task analysis & suggestions','📊 Real-time productivity insights','🔒 Secure JWT authentication','⚡ Smart search & filtering'].map((f,i) => (
              <div key={i} className="flex items-center gap-3 text-blue-100 bg-white/5 rounded-lg px-4 py-3 text-sm">{f}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-8 gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <FiCpu className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI Task Manager</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-gray-500 text-sm mb-8">Sign in to continue</p>

            {loginErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{loginErrors.general}</div>
            )}

            <form onSubmit={submitLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="email" name="email" value={loginForm.email} onChange={handleLoginChange}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${loginErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                </div>
                {loginErrors.email && <p className="mt-1 text-xs text-red-500">{loginErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type={showPwd ? 'text' : 'password'} name="password" value={loginForm.password} onChange={handleLoginChange}
                    placeholder="Enter your password"
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${loginErrors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                  <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {loginErrors.password && <p className="mt-1 text-xs text-red-500">{loginErrors.password}</p>}
              </div>

              <button type="submit" disabled={loginLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
                {loginLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in...</> : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-medium">Create account</Link>
            </p>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 text-center">
              Demo: <strong>demo@example.com</strong> / <strong>Demo@1234</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
