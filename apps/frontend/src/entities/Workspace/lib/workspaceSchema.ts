import * as yup from 'yup'

export const workspaceSettingsSchema = yup.object().shape({
  title: yup
    .string()
    .required('Название рабочего пространства не может быть пустым')
    .min(3, 'Название рабочего пространства должно быть не менее 3 символов')
})
