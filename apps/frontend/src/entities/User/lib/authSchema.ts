import * as yup from 'yup'
import { emailRegexp } from '@/entities/User/const/const'

const commonSchema = {
  email: yup
    .string()
    .required('requiredEmail')
    .matches(emailRegexp, 'invalidEmail'),
  password: yup.string().required('requiredPassword')
}

export const signUpSchema = yup.object().shape({
  firstName: yup.string().min(1, 'minNameLength').required('requiredFirstName'),
  lastName: yup
    .string()
    .min(1, 'minLastNameLength')
    .required('requiredLastName'),
  hasPoliciesAgreement: yup
    .boolean()
    .oneOf([true], 'Необходимо принять условия'),
  ...commonSchema
})

export const signInSchema = yup.object().shape({
  ...commonSchema
})

export const resetPasswordRequestSchema = yup.object().shape({
  email: commonSchema.email
})

export const setPasswordSchema = yup.object().shape({
  password: commonSchema.password,
  copyPassword: commonSchema.password
})
