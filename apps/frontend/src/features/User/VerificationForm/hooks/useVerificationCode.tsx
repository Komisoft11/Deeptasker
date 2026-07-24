import React, { ChangeEvent, useRef, useState } from 'react'
import { UseFormReturn } from 'react-hook-form'
import { singleDigitRegex, sixDigitCodeRegex } from '@/features/User/VerificationForm/const/const'

export interface UseVerificationCodeProps {
  form: UseFormReturn<{ code: string }>
  codeLength?: number
}

export function useVerificationCode({
  form,
  codeLength = 6
}: UseVerificationCodeProps) {
  const { clearErrors } = form
  const [code, setCode] = useState<string[]>(new Array(codeLength).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const isEmpty = !code.every((digit) => digit !== '')

  const updateCodeAtIndex = (value: string, index: number) => {
    clearErrors('code')
    setCode((prev) => {
      const newCode = [...prev]
      newCode[index] = value
      form.setValue('code', newCode.join(''))
      return newCode
    })
  }

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = e.target.value
    if (singleDigitRegex.test(value) || value === '') {
      updateCodeAtIndex(value, index)
      if (value && index < code.length - 1) {
        inputRefs.current[index + 1]?.focus()
      }
    }
  }

  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const pasteData = e.clipboardData.getData('text').trim()
    if (sixDigitCodeRegex.test(pasteData)) {
      const newCode = pasteData.split('')
      setCode(newCode)
      form.setValue('code', newCode.join(''))
      if (index + newCode.length < inputRefs.current.length) {
        inputRefs.current[index + newCode.length - 1]?.focus()
      } else {
        inputRefs.current[inputRefs.current.length - 1]?.focus()
      }
    }
  }

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === 'Backspace') {
      if (code[index] === '') {
        if (index > 0) {
          inputRefs.current[index - 1]?.focus()
        }
      } else {
        const newCode = [...code]
        newCode[index] = ''
        setCode(newCode)
        form.setValue('code', newCode.join(''))
      }
    }
  }


  const resetVerificationCode = () => {
    setCode(new Array(codeLength).fill(''))
  }

  return {
    code,
    resetVerificationCode,
    isEmpty,
    inputRefs,
    handleInputChange,
    handlePaste,
    handleKeyDown
  }
}
