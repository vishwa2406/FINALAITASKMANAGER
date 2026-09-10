/**
 * FRONTEND MODEL — Department domain definitions
 */

export const DEFAULT_DEPARTMENTS = [
  { id: 1, code: 'HR',        name: 'Human Resources'            },
  { id: 2, code: 'FINANCE',   name: 'Finance'                    },
  { id: 3, code: 'IT',        name: 'Information Technology'     },
  { id: 4, code: 'SALES',     name: 'Sales'                      },
  { id: 5, code: 'MARKETING', name: 'Marketing'                  },
]

export const DEPARTMENT_COLORS = {
  HR:        { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  FINANCE:   { bg: 'bg-blue-100',    text: 'text-blue-800',    border: 'border-blue-300'    },
  IT:        { bg: 'bg-violet-100',  text: 'text-violet-800',  border: 'border-violet-300'  },
  SALES:     { bg: 'bg-amber-100',   text: 'text-amber-800',   border: 'border-amber-300'   },
  MARKETING: { bg: 'bg-pink-100',    text: 'text-pink-800',    border: 'border-pink-300'    },
  DEFAULT:   { bg: 'bg-gray-100',    text: 'text-gray-800',    border: 'border-gray-300'    },
}

export const getDepartmentBadge = (code) => {
  return DEPARTMENT_COLORS[code?.toUpperCase()] || DEPARTMENT_COLORS.DEFAULT
}
