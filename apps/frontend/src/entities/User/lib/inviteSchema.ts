import * as yup from 'yup'
import { emailRegexp } from '@/entities/User/const/const'

export const inviteSchema = (existingEmails: string[]) =>
  yup.object().shape({
    email: yup
      .string()
      .trim()
      .required('E-mail обязательный')
      .matches(emailRegexp, 'Это не e-mail')
      .test('not-duplicate', 'Такой пользователь уже приглашен', (value) => {
        if (!value) return true
        return !existingEmails.includes(value.trim())
      })
  })