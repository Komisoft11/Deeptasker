export interface IAuthInput<T> {
  label: string
  name: T
}

export interface IAuthFormData {
  username?: string
  firstName: string
  lastName: string
  email: string
  password: string
  hasPoliciesAgreement: boolean
}
