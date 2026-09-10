/**
 * CONTROLLER — useAiController
 * Handles all AI page interactions: analysis requests,
 * suggestion fetching, and tab state.
 */
import { useState } from 'react'
import toast from 'react-hot-toast'
import api from '../api'

export const useAiController = () => {
  const [activeTab,         setActiveTab]         = useState('analysis')
  const [analysis,          setAnalysis]          = useState('')
  const [suggestions,       setSuggestions]       = useState([])
  const [analysisLoading,   setAnalysisLoading]   = useState(false)
  const [suggestionsLoading,setSuggestionsLoading] = useState(false)

  const fetchAnalysis = async () => {
    setAnalysisLoading(true)
    try {
      const { data } = await api.get('/ai/productivity-analysis')
      setAnalysis(data.data)
      toast.success('Analysis complete!')
    } catch {
      toast.error('AI unavailable — check your OpenAI API key')
    } finally {
      setAnalysisLoading(false)
    }
  }

  const fetchSuggestions = async () => {
    setSuggestionsLoading(true)
    try {
      const { data } = await api.get('/ai/task-suggestions')
      setSuggestions(data.data)
      toast.success('Suggestions ready!')
    } catch {
      toast.error('AI unavailable — check your OpenAI API key')
    } finally {
      setSuggestionsLoading(false)
    }
  }

  return {
    activeTab, setActiveTab,
    analysis, analysisLoading, fetchAnalysis,
    suggestions, suggestionsLoading, fetchSuggestions,
  }
}
