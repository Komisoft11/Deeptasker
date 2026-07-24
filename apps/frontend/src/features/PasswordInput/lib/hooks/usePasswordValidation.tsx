import React, { useCallback, useState } from 'react'
import {
  IPasswordValidations,
  StrengthIndicator,
  checkStrength,
  validatePassword
} from '@/features/PasswordInput'

const initialPasswordValidation: IPasswordValidations = {
  onlyLatin: null,
  minLength: null,
  hasBothCases: null,
  hasSymbol: null
}

export function usePasswordValidation() {
  const [validations, setValidations] = useState<IPasswordValidations>(
    initialPasswordValidation
  )
  const [strength, setStrength] = useState<StrengthIndicator>('default')

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value

    if (password) {
      setValidations(validatePassword(password))
      setStrength(checkStrength(password))
    } else {
      setValidations(initialPasswordValidation)
      setStrength('default')
    }
  }, [])

  const resetValidation = useCallback(() => {
    setValidations(initialPasswordValidation)
    setStrength('default')
  }, [])

  return {
    validations,
    strength,
    handleChange,
    resetValidation
  }
}
