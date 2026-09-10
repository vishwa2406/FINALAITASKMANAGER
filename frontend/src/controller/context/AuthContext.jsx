/**
 * ============================================================
 * CONTROLLER LAYER — AuthContext
 * ============================================================
 * The MVC Controller in React is implemented as:
 *  - Custom hooks     → handle logic for a single feature
 *  - Context          → share controller state globally
 *
 * AuthContext is the global "Auth Controller":
 *  • Holds auth state (user, isAuthenticated)
 *  • Exposes login() / logout() actions
 *  • Any View component calls useAuth() to get state/actions
 * ============================================================
 */
import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate              = useNavigate()

  // Rehydrate from localStorage on app start
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user')
      const token     = localStorage.getItem('token')
      if (savedUser && token) setUser(JSON.parse(savedUser))
    } catch {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }, [])

  /** Called by useAuthController after successful login/register API call */
  const login = (authResponse) => {
    const userData = {
      id:             authResponse.userId,
      fullName:       authResponse.fullName,
      email:          authResponse.email,
      role:           authResponse.role,
      departmentId:   authResponse.departmentId,
      departmentName: authResponse.departmentName,
      departmentCode: authResponse.departmentCode,
    }
    localStorage.setItem('token', authResponse.token)
    localStorage.setItem('user',  JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/login')
    toast.success('Logged out successfully')
  }

  const value = { user, isAuthenticated: !!user, loading, login, logout }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
