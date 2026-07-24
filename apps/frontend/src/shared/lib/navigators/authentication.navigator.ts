import {
  ACTIVATION_ACCOUNT_URL,
  AUTH_URL,
  LOGIN_URL,
  REGISTER_URL,
  RESET_PASSWORD_REQUEST_URL,
  RESET_PASSWORD_SET_URL,
  RESET_PASSWORD_VERIFY_URL
} from '@/shared/config/route.config'

export const AuthenticationNavigator = {
  getAuthUrl(): string {
    return '/' + AUTH_URL
  },
  getLoginUrl(): string {
    return `${this.getAuthUrl()}/${LOGIN_URL}`
  },
  getRegisterUrl(): string {
    return `${this.getAuthUrl()}/${REGISTER_URL}`
  },
  getActivationUrl(): string {
    return `${this.getAuthUrl()}/${ACTIVATION_ACCOUNT_URL}`
  },
  getResetPasswordRequestUrl(): string {
    return `${this.getAuthUrl()}/${RESET_PASSWORD_REQUEST_URL}`
  },
  getResetPasswordVerifyUrl(): string {
    return `${this.getAuthUrl()}/${RESET_PASSWORD_VERIFY_URL}`
  },
  getSetPasswordUrl(): string {
    return `${this.getAuthUrl()}/${RESET_PASSWORD_SET_URL}`
  }
} as const
