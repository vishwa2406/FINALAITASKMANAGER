import React, { useState } from 'react'
import { FiShield, FiPlus, FiTrash2, FiCheck, FiX, FiBriefcase, FiLock } from 'react-icons/fi'
import { useDepartments } from '../../controller/hooks/useDepartments'
import { useAuth } from '../../controller/context/AuthContext'

export default function AdminRulesPage() {
  const { user } = useAuth()
  const { departments, assignmentRules, createAssignmentRule, deleteAssignmentRule } = useDepartments()

  const [sourceDeptId, setSourceDeptId] = useState('')
  const [targetDeptId, setTargetDeptId] = useState('')
  const [submitting, setSubmitting]     = useState(false)

  const handleAddRule = async (e) => {
    e.preventDefault()
    if (!sourceDeptId || !targetDeptId) return
    setSubmitting(true)
    try {
      await createAssignmentRule({
        sourceDepartmentId: parseInt(sourceDeptId),
        targetDepartmentId: parseInt(targetDeptId),
        active: true
      })
      setSourceDeptId('')
      setTargetDeptId('')
    } finally {
      setSubmitting(false)
    }
  }

  const isAdmin = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl p-8 border border-gray-100 text-center">
        <FiLock size={48} className="text-red-400 mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Access Restricted</h2>
        <p className="text-gray-500 text-sm mt-1">Only Administrators can manage Department Assignment Rules.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <FiShield className="text-blue-600" /> Department Assignment Rules Configuration
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Configure cross-department task assignment permissions. Users in a source department can only assign tasks to permitted target departments.
        </p>
      </div>

      {/* Add New Rule Form */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
        <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
          <FiPlus className="text-blue-600" /> Allow New Cross-Department Assignment
        </h2>

        <form onSubmit={handleAddRule} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Source Department (Sender)</label>
            <select
              value={sourceDeptId}
              onChange={e => setSourceDeptId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Source Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Target Department (Recipient)</label>
            <select
              value={targetDeptId}
              onChange={e => setTargetDeptId(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Target Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name} ({d.code})</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting || !sourceDeptId || !targetDeptId}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          >
            {submitting ? 'Allowing...' : 'Allow Assignment'}
          </button>
        </form>
      </div>

      {/* Rules List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <FiBriefcase className="text-gray-500" /> Active Assignment Rules ({assignmentRules.length})
          </h2>
        </div>

        {assignmentRules.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            <p className="text-sm">No assignment rules defined yet.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
              <tr>
                <th className="px-6 py-3">Source Department</th>
                <th className="px-6 py-3">Permission</th>
                <th className="px-6 py-3">Target Department</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {assignmentRules.map(rule => (
                <tr key={rule.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {rule.sourceDepartmentName} <span className="text-xs font-normal text-gray-400">({rule.sourceDepartmentCode})</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full border border-green-200">
                      <FiCheck size={12} /> Allowed
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {rule.targetDepartmentName} <span className="text-xs font-normal text-gray-400">({rule.targetDepartmentCode})</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => deleteAssignmentRule(rule.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Deactivate Rule"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
