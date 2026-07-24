import * as yup from 'yup'

export const bugFormSchema = yup.object({
  titleField: yup
    .string()
    .required('bugReport.errors.titleField.required')
    .max(100, 'bugReport.errors.titleField.max'),

  location: yup.string().required('bugReport.errors.location'),

  expected: yup.string().required('bugReport.errors.expected'),

  actual: yup.string().required('bugReport.errors.actual')
})
