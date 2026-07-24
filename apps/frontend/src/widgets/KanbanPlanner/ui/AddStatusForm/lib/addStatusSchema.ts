import * as yup from 'yup'

export const addStatusSchema = (existingStatuses: string[]) =>
  yup.object().shape({
    name: yup
      .string()
      .required('Название доски не может быть пустым')
      .min(3, 'Название доски не может быть меньше 3 символов')
      .test(
        'unique-name',
        'Название доски уже существует',
        (value) => !existingStatuses.includes(value.trim())
      )
  })
