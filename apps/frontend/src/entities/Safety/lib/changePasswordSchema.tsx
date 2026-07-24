import * as yup from 'yup'

export const changePasswordSchema = yup.object().shape({
  password: yup.string().strict().required('Введите текущий пароль'),
  newPassword: yup
    .string()
    .strict()
    .required('newPassword')
    .min(6, 'user.minPasswordLength')
    .notOneOf([yup.ref('password')], 'user.passwordSame')
    .matches(
      /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>~`'_\-+=\[\]\\\/]*$/,
      'user.usernamePattern'
    )
    .matches(/[A-Z]/, 'user.passwordUppercase'),
  confirmPassword: yup
    .string()
    .required('user.repeatPassword')
    .oneOf([yup.ref('newPassword')], 'user.passwordsMismatch')
})
