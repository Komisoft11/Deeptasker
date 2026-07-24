import * as yup from 'yup'

export const createSprintSchema = (
  checkTitleUnique: (title: string) => boolean
) =>
  yup.object({
    title: yup
      .string()
      .max(255, 'Название не должно превышать 255 символов')
      .required('Название обязательно')
      .test('is-title-unique', 'Такой спринт уже существует', checkTitleUnique),

    description: yup.string().notRequired(),

    projectId: yup.number().required('ID проекта обязателен'),

    dateStart: yup
      .date()
      .nullable()
      .typeError('Дата начала должна быть валидной датой')
      .required('Дата начала обязательна'),

    dateEnd: yup
      .date()
      .nullable()
      .typeError('Дата окончания должна быть валидной датой')
      .min(
        yup.ref('dateStart'),
        'Дата окончания не может быть раньше даты начала'
      )
      .required('Дата окончания обязательна')
  })
