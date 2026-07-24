import * as yup from 'yup'

export const projectSettingsSchema = (
  titleTestFunction: (value: any) => Promise<boolean>,
  slugTestFunction: (value: any) => Promise<boolean>
) =>
  yup.object().shape({
    title: yup
      .string()
      .required('Название проекта не может быть пустым')
      .min(3, 'Название проекта должно содержать не менее 3 символов')
      .test(
        'is-title-unique',
        'Проект с таким названием уже существует',
        titleTestFunction
      ),
    slug: yup
      .string()
      .required('Путь не может быть пустым')
      .min(3, 'Путь должен содержать не менее 3 символов')
      .test('is-slug-unique', 'Такой путь уже существует', slugTestFunction)
  })
