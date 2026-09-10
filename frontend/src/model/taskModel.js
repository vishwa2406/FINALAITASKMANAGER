/**
 * ============================================================
 * FRONTEND — MODEL LAYER
 * ============================================================
 * The Model defines all domain data shapes, constants, and
 * enum-equivalents used across the application.
 *
 * This mirrors the backend's model/enums/* layer.
 * Keeping these here means:
 *  • A single source of truth for labels, colors, values
 *  • View components just consume these — never hardcode
 *  • If you rename a status, you change it in ONE place
 * ============================================================
 */

// ── Task Status ───────────────────────────────────────────────
export const TASK_STATUS = {
  TODO:                 'TODO',
  IN_PROGRESS:          'IN_PROGRESS',
  SUBMITTED_FOR_REVIEW: 'SUBMITTED_FOR_REVIEW',
  COMPLETED:            'COMPLETED',
  REJECTED:             'REJECTED',
  CANCELLED:            'CANCELLED',
}

export const TASK_STATUS_LABELS = {
  TODO:                 'To Do',
  IN_PROGRESS:          'In Progress',
  SUBMITTED_FOR_REVIEW: 'Submitted for Review',
  COMPLETED:            'Completed',
  REJECTED:             'Rejected',
  CANCELLED:            'Cancelled',
}

export const TASK_STATUS_COLORS = {
  TODO:                 { bg: 'bg-indigo-100', text: 'text-indigo-700', hex: '#6366f1' },
  IN_PROGRESS:          { bg: 'bg-amber-100',  text: 'text-amber-700',  hex: '#f59e0b' },
  SUBMITTED_FOR_REVIEW: { bg: 'bg-purple-100', text: 'text-purple-700', hex: '#8b5cf6' },
  COMPLETED:            { bg: 'bg-green-100',  text: 'text-green-700',  hex: '#22c55e' },
  REJECTED:             { bg: 'bg-rose-100',   text: 'text-rose-700',   hex: '#f43f5e' },
  CANCELLED:            { bg: 'bg-gray-100',   text: 'text-gray-500',   hex: '#94a3b8' },
}

export const TASK_VIEW_TYPES = {
  INCOMING:       'INCOMING',
  OUTGOING:       'OUTGOING',
  WAITING_REVIEW: 'WAITING_REVIEW',
  DEPARTMENT:     'DEPARTMENT',
  ALL:            'ALL',
}

// ── Task Priority ─────────────────────────────────────────────
export const TASK_PRIORITY = {
  LOW:    'LOW',
  MEDIUM: 'MEDIUM',
  HIGH:   'HIGH',
  URGENT: 'URGENT',
}

export const TASK_PRIORITY_LABELS = {
  LOW:    'Low',
  MEDIUM: 'Medium',
  HIGH:   'High',
  URGENT: 'Urgent',
}

export const TASK_PRIORITY_COLORS = {
  LOW:    { bg: 'bg-gray-100',   text: 'text-gray-600'   },
  MEDIUM: { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  HIGH:   { bg: 'bg-orange-100', text: 'text-orange-700' },
  URGENT: { bg: 'bg-red-100',    text: 'text-red-700'    },
}

// ── Default form state ────────────────────────────────────────
export const EMPTY_TASK_FORM = {
  title:                  '',
  description:            '',
  status:                 TASK_STATUS.TODO,
  priority:               TASK_PRIORITY.MEDIUM,
  category:               '',
  dueDate:                '',
  estimatedHours:         '',
  actualHours:            '',
  tags:                   '',
  assignedToDepartmentId: '',
  assignedToUserId:       '',
}

// ── Pagination defaults ───────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 10

// ── Sort options ──────────────────────────────────────────────
export const SORT_OPTIONS = [
  { value: 'createdAt', label: 'Created Date' },
  { value: 'dueDate',   label: 'Due Date'     },
  { value: 'title',     label: 'Title'        },
  { value: 'priority',  label: 'Priority'     },
]

// ── Route paths ───────────────────────────────────────────────
export const ROUTES = {
  LOGIN:       '/login',
  REGISTER:    '/register',
  DASHBOARD:   '/dashboard',
  TASKS:       '/tasks',
  TASK:        (id) => `/tasks/${id}`,
  AI:          '/ai',
  PROFILE:     '/profile',
  ADMIN:       '/admin',
  ADMIN_RULES: '/admin/rules',
}
