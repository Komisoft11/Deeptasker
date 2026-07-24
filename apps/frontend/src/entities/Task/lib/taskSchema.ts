import * as yup from 'yup'

export const createTaskSchema = yup.object().shape({
  title: yup.string().required('Название задачи не может быть пустым')
})
