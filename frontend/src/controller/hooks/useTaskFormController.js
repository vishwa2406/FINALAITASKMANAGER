/**
 * CONTROLLER — useTaskFormController
 * Manages create/edit task form state, validation, and submission.
 * Used by the TaskFormModal View component.
 */
import { useState, useEffect } from 'react'
import { EMPTY_TASK_FORM } from '../../model/taskModel'

export const useTaskFormController = (task, onSubmit) => {
  const [form, setForm]     = useState(EMPTY_TASK_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const isEditing = !!task

  useEffect(() => {
    if (task) {
      setForm({
        title:          task.title          || '',
        description:    task.description    || '',
        status:         task.status         || 'TODO',
        priority:       task.priority       || 'MEDIUM',
        category:       task.category       || '',
        dueDate:        task.dueDate        || '',
        estimatedHours: task.estimatedHours != null ? String(task.estimatedHours) : '',
        actualHours:            task.actualHours    != null ? String(task.actualHours)    : '',
        tags:                   task.tags           || '',
        assignedToDepartmentId: task.assignedToDepartmentId != null ? String(task.assignedToDepartmentId) : '',
        assignedToUserId:       task.assignedToUserId       != null ? String(task.assignedToUserId)       : '',
      })
    } else {
      setForm(EMPTY_TASK_FORM)
    }
  }, [task])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(p => ({ ...p, [name]: value }))
    if (errors[name]) setErrors(p => ({ ...p, [name]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (form.estimatedHours && isNaN(Number(form.estimatedHours)))
      e.estimatedHours = 'Must be a number'
    setErrors(e)
    return !Object.keys(e).length
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    try {
      await onSubmit(form, isEditing)
    } finally {
      setLoading(false)
    }
  }

  return { form, errors, loading, isEditing, handleChange, handleSubmit }
}
