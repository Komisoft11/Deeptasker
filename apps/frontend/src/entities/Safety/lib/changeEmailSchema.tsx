import * as yup from 'yup'

export const changeEmailSchema = yup.object().shape({
  email: yup
    .string()
    .strict()
    .required('Введите новый email')
    .email('Введите корректный email')
    .notOneOf([yup.ref('previousEmail')], 'Введите новую почту')
})
