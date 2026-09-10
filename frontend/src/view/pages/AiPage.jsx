import React, { useState } from 'react'
import { FiCpu, FiTrendingUp, FiList, FiLoader, FiZap, FiCheckCircle, FiPlus } from 'react-icons/fi'
import { useAiController } from '../../controller/hooks/useAiController'
import TaskFormModal from '../components/tasks/TaskFormModal'
import api from '../../controller/api'
import toast from 'react-hot-toast'

export default function AiPage() {
  const ctrl = useAiController()
  const [showCreate, setShowCreate] = useState(false)
  const [prefill,    setPrefill]    = useState(null)

  const handleCreateFromSuggestion = (title) => {
    setPrefill({ title, status: 'TODO', priority: 'MEDIUM' })
    setShowCreate(true)
  }

  const handleCreateSubmit = async (formData) => {
    const payload = {
      ...formData,
      estimatedHours: formData.estimatedHours ? parseFloat(formData.estimatedHours) : null,
      actualHours:    formData.actualHours    ? parseFloat(formData.actualHours)    : null,
      dueDate:        formData.dueDate || null,
    }
    try {
      await api.post('/tasks', payload)
      toast.success('Task created!')
      setShowCreate(false)
      setPrefill(null)
    } catch {
      toast.error('Failed to create task')
    }
  }

  const tabs = [
    { id: 'analysis',    label: 'Productivity Analysis', icon: FiTrendingUp },
    { id: 'suggestions', label: 'Task Suggestions',      icon: FiList       },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in">
      {/* Hero */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-blue-700 rounded-2xl p-7 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full translate-x-32 -translate-y-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-24 translate-y-24" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center"><FiCpu size={26} /></div>
            <div>
              <h1 className="text-2xl font-bold">AI Assistant</h1>
              <p className="text-blue-200 text-sm">Powered by GPT-3.5 Turbo</p>
            </div>
          </div>
          <p className="text-blue-100 text-sm leading-relaxed max-w-lg">
            Get personalized productivity insights and AI-suggested tasks based on your work patterns.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => ctrl.setActiveTab(id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${ctrl.activeTab === id ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}>
            <Icon size={16} /><span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Analysis Tab */}
      {ctrl.activeTab === 'analysis' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-2">
              <FiTrendingUp className="text-blue-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">Productivity Analysis</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">AI analyzes your task patterns, completion rate, priorities, and gives personalized coaching.</p>
            <button onClick={ctrl.fetchAnalysis} disabled={ctrl.analysisLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl font-semibold transition-colors">
              {ctrl.analysisLoading ? <><FiLoader className="animate-spin" size={18} /> Analyzing your tasks...</> : <><FiZap size={18} /> Analyze My Productivity</>}
            </button>
            {ctrl.analysisLoading && (
              <div className="mt-4 space-y-2">
                {[1,2,3].map(i => <div key={i} className={`h-3 bg-gray-200 rounded animate-pulse w-${i === 3 ? '4/6' : i === 2 ? '5/6' : 'full'}`} />)}
              </div>
            )}
          </div>

          {ctrl.analysis && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center"><FiCheckCircle className="text-green-600" size={14} /></div>
                <h3 className="font-semibold text-gray-900">Your Analysis</h3>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-5 border border-blue-100">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-7">{ctrl.analysis}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Suggestions Tab */}
      {ctrl.activeTab === 'suggestions' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-2">
              <FiList className="text-purple-600" size={20} />
              <h2 className="text-lg font-semibold text-gray-900">AI Task Suggestions</h2>
            </div>
            <p className="text-sm text-gray-500 mb-5">Based on your existing tasks, AI suggests 5 new tasks to boost your workflow.</p>
            <button onClick={ctrl.fetchSuggestions} disabled={ctrl.suggestionsLoading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-xl font-semibold transition-colors">
              {ctrl.suggestionsLoading ? <><FiLoader className="animate-spin" size={18} /> Generating...</> : <><FiCpu size={18} /> Generate Suggestions</>}
            </button>
            {ctrl.suggestionsLoading && (
              <div className="mt-4 space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            )}
          </div>

          {ctrl.suggestions.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Suggested Tasks</h3>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{ctrl.suggestions.length} tasks</span>
              </div>
              <div className="space-y-2">
                {ctrl.suggestions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-purple-200 hover:bg-purple-50/50 group transition-all">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">{i+1}</span>
                      <span className="text-sm font-medium text-gray-800">{s}</span>
                    </div>
                    <button onClick={() => handleCreateFromSuggestion(s)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 ml-3">
                      <FiPlus size={12} /> Add
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 text-center mt-4">Hover over a suggestion and click "Add" to create it</p>
            </div>
          )}
        </div>
      )}

      {/* How it works */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">MVC + AI Flow</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '🎮', title: 'Controller', desc: 'useAiController hook calls the Spring AiController endpoint' },
            { icon: '🧠', title: 'Service + OpenAI', desc: 'AiService reads Model entities, sends prompts to GPT' },
            { icon: '📋', title: 'View', desc: 'AI response mapped to View DTOs returned to this page' },
          ].map((s,i) => (
            <div key={i} className="text-center p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl mb-2">{s.icon}</div>
              <h4 className="text-sm font-semibold text-gray-800">{s.title}</h4>
              <p className="text-xs text-gray-500 mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {showCreate && <TaskFormModal task={prefill} onClose={() => { setShowCreate(false); setPrefill(null) }} onSubmit={handleCreateSubmit} />}
    </div>
  )
}
