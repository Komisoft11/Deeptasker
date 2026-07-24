import dayjs from 'dayjs'
import * as yup from 'yup'

interface IValidationFunctions {
  isBeforeDateCreated: (value: string) => boolean
  isAfterNow: (value: string) => boolean
  isBeforeStartDate: (value: string, startDate: string) => boolean
  isTimeExist: (
    startDate: string,
    endDate: string,
    editingId?: number
  ) => boolean
}

interface FormContext {
  previousComment: string
}

export const timeSchema = (validationFunctions: IValidationFunctions) =>
  yup.object().shape({
    comment: yup
      .string()
      .required('Комментарий обязательный')
      .min(3, 'Комментарий должен содержать более 3-х символов')
      .max(255, 'Комментарий не может быть более 255-х символов'),
    startDate: yup
      .string()
      .required('Дата начала обязательна')
      .test(
        'is-before-date-created',
        'Дата начала не может быть раньше даты создания задачи',
        validationFunctions.isBeforeDateCreated
      )
      .test(
        'is-after-now',
        'Дата начала не может быть в будущем',
        validationFunctions.isAfterNow
      ),
    endDate: yup
      .string()
      .required('Дата окончания обязательна')
      .test(
        'is-before-start-date',
        'Дата окончания не может быть раньше даты начала',
        (value, context) =>
          validationFunctions.isBeforeStartDate(value, context.parent.startDate)
      )
      .test(
        'is-after-now',
        'Дата окончания не может быть в будущем',
        validationFunctions.isAfterNow
      )
      .test(
        'is-time-exist',
        'Временной интервал пересекается с существующим',
        function (value) {
          const { startDate } = this.parent
          if (!startDate || !value) return true
          return !validationFunctions.isTimeExist(startDate, value)
        }
      )
  })

export const editTimeSchema = (
  validationFunctions: Pick<
    IValidationFunctions,
    'isBeforeStartDate' | 'isAfterNow' | 'isTimeExist'
  >,
  startDate: Date,
  timeId: number,
  editEndTimeId: number | null
) => {
  const commonSchema = yup.object().shape({
    comment: yup
      .string()
      .required('Комментарий обязательный')
      .min(3, 'Комментарий должен содержать более 3-х символов')
      .max(255, 'Комментарий не может быть более 255-х символов')
      .test(
        'comment-difference',
        'Комментарий должен отличаться от предыдущего',
        function (value) {
          const { previousComment } = this.options.context as FormContext
          return value !== previousComment
        }
      )
  })

  const schemaWithEndDateRequired = commonSchema.shape({
    endDate: yup
      .string()
      .required('Дата окончания обязательна')
      .test(
        'is-before-start-date',
        'Дата окончания не может быть раньше даты начала',
        (value) =>
          validationFunctions.isBeforeStartDate(
            value,
            dayjs(startDate).format('DD.MM.YYYY, HH:mm:ss')
          )
      )
      .test(
        'is-after-now',
        'Дата окончания не может быть в будущем',
        validationFunctions.isAfterNow
      )
      .test(
        'is-time-exist',
        'Временной интервал пересекается с существующим',
        function (value) {
          const stringStartDate = dayjs(startDate).format(
            'DD.MM.YYYY, HH:mm:ss'
          )
          return (
            !value ||
            !validationFunctions.isTimeExist(stringStartDate, value, timeId)
          )
        }
      )
  })

  const schemaWithoutEndDateRequired = commonSchema.shape({
    endDate: yup.string().nullable()
  })

  return editEndTimeId !== null
    ? schemaWithEndDateRequired
    : schemaWithoutEndDateRequired
}
