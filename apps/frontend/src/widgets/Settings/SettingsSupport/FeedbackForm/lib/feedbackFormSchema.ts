import * as yup from 'yup'

export const feedbackFormSchema = yup.object({
  rating: yup.string().required('feedback.errors.rating'),

  liked: yup.string().required('feedback.errors.liked'),

  frustrating: yup.string().required('feedback.errors.frustrating'),

  missingFeature: yup.string().required('feedback.errors.missingFeature'),

  usability: yup.string().required('feedback.errors.usability'),

  goal: yup.string().required('feedback.errors.goal'),

  extra: yup.string().required('feedback.errors.extra')
})
