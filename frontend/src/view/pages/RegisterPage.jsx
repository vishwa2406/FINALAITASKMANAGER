import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCpu, FiCheckCircle } from 'react-icons/fi'
import { useAuthController } from '../../controller/hooks/useAuthController'
import { getPasswordStrength } from '../../model/userModel'

export default function RegisterPage() {
  const { regForm, regErrors, regLoading, handleRegChange, submitRegister } = useAuthController()
  const [showPwd, setShowPwd] = useState(false)
  const strength = getPasswordStrength(regForm.password)

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
          <h1 className="text-4xl font-bold text-white mb-4">Get Started Free</h1>
          <p className="text-blue-200 text-lg mb-10 max-w-sm">Join thousands managing tasks smarter with AI.</p>
          <div className="space-y-3 max-w-sm mx-auto">
            {['No credit card required','AI insights from day one','Unlimited tasks','Secure & private'].map((f,i) => (
              <div key={i} className="flex items-center gap-3 text-blue-100">
                <FiCheckCircle className="text-green-400 flex-shrink-0" size={18} />
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden flex items-center justify-center mb-8 gap-3">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <FiCpu className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">AI Task Manager</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Create account</h2>
            <p className="text-gray-500 text-sm mb-8">Start managing tasks with AI today</p>

            {regErrors.general && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{regErrors.general}</div>
            )}

            <form onSubmit={submitRegister} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="text" name="fullName" value={regForm.fullName} onChange={handleRegChange}
                    placeholder="John Doe"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${regErrors.fullName ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                </div>
                {regErrors.fullName && <p className="mt-1 text-xs text-red-500">{regErrors.fullName}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="email" name="email" value={regForm.email} onChange={handleRegChange}
                    placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${regErrors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                </div>
                {regErrors.email && <p className="mt-1 text-xs text-red-500">{regErrors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type={showPwd ? 'text' : 'password'} name="password" value={regForm.password} onChange={handleRegChange}
                    placeholder="Min 8 chars, uppercase, number"
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${regErrors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                  <button type="button" onClick={() => setShowPwd(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPwd ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {regForm.password && (
                  <div className="mt-2">
                    <div className="flex gap-1 mb-1">
                      {[1,2,3,4,5].map(i => (
                        <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.score ? strength.color : 'bg-gray-200'}`} />
                      ))}
                    </div>
                    <p className={`text-xs ${strength.score >= 4 ? 'text-green-600' : strength.score >= 3 ? 'text-yellow-600' : 'text-red-500'}`}>{strength.label}</p>
                  </div>
                )}
                {regErrors.password && <p className="mt-1 text-xs text-red-500">{regErrors.password}</p>}
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <select name="departmentId" value={regForm.departmentId || ''} onChange={handleRegChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select Department</option>
                  <option value="1">Human Resources (HR)</option>
                  <option value="2">Finance (FINANCE)</option>
                  <option value="3">Information Technology (IT)</option>
                  <option value="4">Sales (SALES)</option>
                  <option value="5">Marketing (MARKETING)</option>
                </select>
              </div>

              {/* Role / Designation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role / Designation</label>
                <select name="role" value={regForm.role || 'USER'} onChange={handleRegChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="USER">Executive / Employee</option>
                  <option value="MANAGER">Department Manager</option>
                  <option value="ADMIN">System Admin</option>
                </select>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                  <input type="password" name="confirmPassword" value={regForm.confirmPassword} onChange={handleRegChange}
                    placeholder="Re-enter password"
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${regErrors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                </div>
                {regErrors.confirmPassword && <p className="mt-1 text-xs text-red-500">{regErrors.confirmPassword}</p>}
              </div>

              <button type="submit" disabled={regLoading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 mt-2">
                {regLoading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</> : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
