export type StrengthIndicator = 'low' | 'medium' | 'high' | 'default'

export interface IPasswordValidations {
  onlyLatin: boolean | null
  minLength: boolean | null
  hasBothCases: boolean | null
  hasSymbol: boolean | null
}
