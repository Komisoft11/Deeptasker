export const validatePassword = (password: string) => ({
  onlyLatin: /^[a-zA-Z0-9!@#$%^&*(),.?":{}|<>~`'_\-+=\[\]\\\/]*$/.test(
    password
  ),
  minLength: password.length >= 6,
  hasBothCases: /(?=.*[A-Z])(?=.*[a-z])/.test(password),
  hasSymbol: /[!@#$%^&*(),.?":{}|<>~`'_\-+=\[\]\\\/]/.test(password)
})
