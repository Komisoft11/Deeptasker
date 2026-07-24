import * as yup from 'yup'

export const folderMenuSchema = (
  testFunction: (value: any) => Promise<boolean>
) =>
  yup.object().shape({
    title: yup
      .string()
      .required('Название папки не может быть пустым')
      .min(3, 'Название папки не может быть меньше 3 символов')
      .test(
        'is-title-unique',
        'Папка с таким названием уже существует',
        testFunction
      )
  })
