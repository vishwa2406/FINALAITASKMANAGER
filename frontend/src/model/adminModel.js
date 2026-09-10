/**
 * ============================================================
 * FRONTEND — MODEL LAYER — Admin & Activity Tracking
 * ============================================================
 * Domain constants, category badges, labels, colors, and filters
 * for the Admin Activity Tracking Panel.
 * ============================================================
 */

export const ACTIVITY_CATEGORIES = {
  ALL:        'ALL',
  AUTH:       'AUTH',
  TASK:       'TASK',
  ADMIN:      'ADMIN',
  AI:         'AI',
  DEPARTMENT: 'DEPARTMENT',
}

export const ACTIVITY_CATEGORY_LABELS = {
  ALL:        'All Categories',
  AUTH:       'Security & Auth',
  TASK:       'Task Operations',
  ADMIN:      'Admin Actions',
  AI:         'AI Intelligence',
  DEPARTMENT: 'Department Rules',
}

export const ACTIVITY_CATEGORY_BADGES = {
  AUTH:       { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: 'FiLock' },
  TASK:       { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: 'FiCheckSquare' },
  ADMIN:      { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: 'FiShield' },
  AI:         { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: 'FiCpu' },
  DEPARTMENT: { bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', icon: 'FiBriefcase' },
}

export const SYSTEM_ROLES = [
  { value: 'USER', label: 'User' },
  { value: 'MANAGER', label: 'Manager' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
]

export const DEFAULT_ACTIVITY_FILTER = {
  category: '',
  userEmail: '',
  search: '',
  page: 0,
  size: 15,
}
