/**
 * ============================================================
 * CONTROLLER LAYER — useAuthController hook
 * ============================================================
 * Handles ALL auth logic for Login and Register pages:
 *  • Form state management
 *  • Validation (against the Model's rules)
 *  • API calls
 *  • Error handling
 *
 * The View (LoginPage, RegisterPage) calls this hook and gets
 * back state + handlers — zero business logic in the View.
 * ============================================================
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import { validatePassword } from '../../model/userModel'

export const useAuthController = () => {
  const { login } = useAuth()
  const navigate  = useNavigate()

  // ── Login ──────────────────────────────────────────────────
  const [loginForm, setLoginForm]       = useState({ email: '', password: '' })
  const [loginErrors, setLoginErrors]   = useState({})
  const [loginLoading, setLoginLoading] = useState(false)

  const handleLoginChange = (e) => {
    const { name, value } = e.target
    setLoginForm(p => ({ ...p, [name]: value }))
    if (loginErrors[name]) setLoginErrors(p => ({ ...p, [name]: '' }))
  }

  const submitLogin = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!loginForm.email)    errors.email    = 'Email is required'
    if (!loginForm.password) errors.password = 'Password is required'
    if (Object.keys(errors).length) { setLoginErrors(errors); return }

    setLoginLoading(true)
    try {
      const { data } = await api.post('/auth/login', loginForm)
      login(data.data)
      toast.success(`Welcome back, ${data.data.fullName}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      toast.error(msg)
      setLoginErrors({ general: msg })
    } finally {
      setLoginLoading(false)
    }
  }

  // ── Register ───────────────────────────────────────────────
  const [regForm, setRegForm]       = useState({ fullName: '', email: '', password: '', confirmPassword: '', departmentId: '', role: 'USER' })
  const [regErrors, setRegErrors]   = useState({})
  const [regLoading, setRegLoading] = useState(false)

  const handleRegChange = (e) => {
    const { name, value } = e.target
    setRegForm(p => ({ ...p, [name]: value }))
    if (regErrors[name]) setRegErrors(p => ({ ...p, [name]: '' }))
  }

  const submitRegister = async (e) => {
    e.preventDefault()
    const errors = {}
    if (!regForm.fullName.trim() || regForm.fullName.trim().length < 2)
      errors.fullName = 'Full name must be at least 2 characters'
    if (!regForm.email || !/\S+@\S+\.\S+/.test(regForm.email))
      errors.email = 'Valid email is required'
    const pwdErrors = validatePassword(regForm.password)
    if (pwdErrors.length) errors.password = pwdErrors[0]
    if (regForm.password !== regForm.confirmPassword)
      errors.confirmPassword = 'Passwords do not match'
    if (Object.keys(errors).length) { setRegErrors(errors); return }

    setRegLoading(true)
    try {
      const payload = {
        fullName: regForm.fullName,
        email:    regForm.email,
        password: regForm.password,
        role:     regForm.role || 'USER',
        departmentId: regForm.departmentId ? parseInt(regForm.departmentId) : null,
      }
      const { data } = await api.post('/auth/register', payload)
      login(data.data)
      toast.success(`Welcome, ${data.data.fullName}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed'
      toast.error(msg)
      setRegErrors({ general: msg })
    } finally {
      setRegLoading(false)
    }
  }

  return {
    loginForm, loginErrors, loginLoading, handleLoginChange, submitLogin,
    regForm,   regErrors,   regLoading,   handleRegChange,   submitRegister,
  }
}
