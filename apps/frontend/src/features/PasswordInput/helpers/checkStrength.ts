import { StrengthIndicator } from '@/features/PasswordInput'

export const checkStrength = (password: string): StrengthIndicator => {
  if (!password) return 'default'

  if (password.length < 6) return 'low'

  const hasUpper = /[A-Z]/.test(password)
  const hasLower = /[a-z]/.test(password)

  return hasUpper && hasLower ? 'high' : 'medium'
}
