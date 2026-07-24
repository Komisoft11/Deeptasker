import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ERRORS } from '@/shared/const/translation'

type Params = {
  initialValue: string
  onSave: (value: string) => void
}

export const useEditableTitle = ({ initialValue, onSave }: Params) => {
  const [value, setValue] = useState(initialValue)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const { t } = useTranslation([ERRORS])

  useEffect(() => {
    setValue(initialValue)
  }, [initialValue])

  const validate = (value: string) => {
    return value.length >= 1 ? '' : t('task.taskTitleRequired', { ns: ERRORS })
  }

  const startEditing = () => {
    setError('')
    setIsEditing(true)
  }

  const cancelEditing = () => {
    setValue(initialValue)
    setError('')
    setIsEditing(false)
  }

  const handleChange = (value: string) => {
    setValue(value)
    setError(validate(value))
  }

  const save = () => {
    if (error) return

    setIsEditing(false)

    if (value !== initialValue) {
      onSave(value)
    }
  }

  return {
    value,
    error,
    isEditing,
    setIsEditing,
    startEditing,
    cancelEditing,
    handleChange,
    save
  }
}
