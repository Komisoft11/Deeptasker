export const API_URL = import.meta.env.VITE_APP_API_HOST
//HTTP CODES LIST
export const BAD_REQUEST = 400
export const UNAUTHORIZED = 401
export const FORBIDDEN = 403
export const NOT_FOUND = 404
export const METHOD_NOT_ALLOWED = 405
export const INTERNAL_SERVER_ERROR = 500
export const BAD_GATEWAY = 502
export const GATEWAY_TIMEOUT = 504

//HTTP MESSAGE ERROR AUTH
export const ALREADY_REGISTERED: string = 'Email already registered'
export const USER_NOT_FOUND: string = 'User not found'
export const ACCOUNT_IS_NOT_ACTIVATED: string = 'Account is not activated'
export const INCORRECT_EMAIL_OR_PASSWORD = 'Incorrect email or password'
export const CAN_NOT_FIND_VERIFICATION_CODE = 'Can not find verification code'
export const VERIFICATION_CODE_EXPIRED = 'Verification code is expired'
export const INVALID_VERIFICATION_CODE = 'Invalid verification code'
export const INCORRECT_PASSWORD = 'Incorrect password'

//HTTP MESSAGE ERROR WORKSPACE
export const ALREADY_ADMIN_WORKSPACE = 'User is already admin of this workspace'
export const ALREADY_INVITED_WORKSPACE =
  'User is already invited to this workspace'

//HTTP MESSAGE ERROR PROJECT
export const ALREADY_MEMBER_PROJECT = 'User is already member of this project'
export const ALREADY_INVITED_PROJECT = 'User is already invited to this project'
export const INVITATION_NOT_FOND = 'Invitation not found'
export const INVITATION_NOT_VALID = 'Invitation not valid'

//HTTP MESSAGE ERROR SPRINT
export const SPRINT_FORBIDDEN =
  'You do not have access to sprints of this project!'
