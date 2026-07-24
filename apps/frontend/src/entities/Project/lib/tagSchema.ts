import * as yup from 'yup'

export const tagCreateSchema = (testFunction: (value: string) => boolean) =>
  yup.object().shape({
    name: yup
      .string()
      .required('Имя обязательно')
      .max(13, 'Максимальная длина 13 символов')
      .test('unique', 'Тег с таким именем уже существует', testFunction)
  })
