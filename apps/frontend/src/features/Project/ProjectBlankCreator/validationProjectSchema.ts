import * as yup from 'yup'

export const getProjectSchema = () => {
  return yup.object().shape({
    title: yup.string()
  })
}
