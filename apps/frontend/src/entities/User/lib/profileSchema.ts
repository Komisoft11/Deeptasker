import * as yup from 'yup'

export const profilePageSchema = yup.object().shape({
  firstName: yup.string().required('Имя пользователя не может быть пустым'),
  lastName: yup.string().required('Фамилия пользователя не может быть пустой')
})
