/**
 * FRONTEND MODEL — User domain definitions
 * Mirrors backend model/enums/Role.java
 */

export const USER_ROLE = {
  USER:        'USER',
  MANAGER:     'MANAGER',
  ADMIN:       'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN',
}

export const USER_ROLE_LABELS = {
  USER:        'User / Executive',
  MANAGER:     'Manager',
  ADMIN:       'Admin',
  SUPER_ADMIN: 'Super Admin',
}

export const USER_ROLE_BADGES = {
  USER:        { bg: 'bg-slate-100',  text: 'text-slate-700' },
  MANAGER:     { bg: 'bg-purple-100', text: 'text-purple-700' },
  ADMIN:       { bg: 'bg-amber-100',  text: 'text-amber-800' },
  SUPER_ADMIN: { bg: 'bg-red-100',    text: 'text-red-700' },
}

/** Shape of the user object stored in localStorage after login */
export const EMPTY_USER = {
  id:       null,
  fullName: '',
  email:    '',
  role:     USER_ROLE.USER,
}

/** Password validation rules (mirrors backend @Pattern) */
export const PASSWORD_RULES = {
  minLength:    8,
  requireUpper: true,
  requireLower: true,
  requireDigit: true,
}

export const validatePassword = (password) => {
  const errors = []
  if (!password || password.length < PASSWORD_RULES.minLength)
    errors.push(`At least ${PASSWORD_RULES.minLength} characters`)
  if (!/[A-Z]/.test(password)) errors.push('One uppercase letter')
  if (!/[a-z]/.test(password)) errors.push('One lowercase letter')
  if (!/\d/.test(password))    errors.push('One number')
  return errors
}

export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' }
  let score = 0
  if (password.length >= 8)        score++
  if (/[A-Z]/.test(password))      score++
  if (/[a-z]/.test(password))      score++
  if (/\d/.test(password))         score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  const levels = [
    { score: 0, label: '',            color: ''             },
    { score: 1, label: 'Very Weak',   color: 'bg-red-500'   },
    { score: 2, label: 'Weak',        color: 'bg-orange-500'},
    { score: 3, label: 'Fair',        color: 'bg-yellow-500'},
    { score: 4, label: 'Strong',      color: 'bg-blue-500'  },
    { score: 5, label: 'Very Strong', color: 'bg-green-500' },
  ]
  return levels[score]
}
