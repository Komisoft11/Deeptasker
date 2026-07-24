type OtpType =
  | 'ACTIVATE_USER'
  | 'RESET_PASSWORD'
  | 'CHANGE_PASSWORD'
  | 'CHANGE_EMAIL'
  | 'DELETE_ACCOUNT'

export interface OtpRequestedEvent {
  OTP_REQUESTED: {
    code: string
    otpType: OtpType
  }
}
