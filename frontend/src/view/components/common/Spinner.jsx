import React from 'react'

export const Spinner = ({ size = 'md', className = '' }) => {
  const s = { sm: 'w-5 h-5 border-2', md: 'w-8 h-8 border-4', lg: 'w-12 h-12 border-4' }[size]
  return <div className={`${s} border-blue-500 border-t-transparent rounded-full animate-spin ${className}`} />
}

export const PageSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <Spinner size="lg" />
  </div>
)

export default Spinner

