export { AuthService } from './services/auth.service'
export { AuthStore } from './model/auth.store'
export { removeTokensStorage } from './helpers/auth.helper'

export type {
  IUser,
  UserFindQueryParams,
  IUserProfileInfo,
  IAccessToken,
  IAuthResponse
} from './model/types/user.interface'
export type {
  IAuthFormData,
  IAuthInput
} from './model/types/AuthForm.interface'
export type {
  IResetPasswordRequestDto,
  IResetPasswordVerifyDto,
  ISetPasswordDto
} from './model/types/ResetPasswordFrom.interface'

// UI
export { UserOption } from './ui/UserOption/UserOption'
export { UserAutocomplete } from './ui/UserAutocomplete/UserAutocomplete'
//API
export { usersQueries } from './api/user'
// HOOKS
export { useUsers } from './lib/hooks/useUsers'

//SCHEMAS
export {
  signUpSchema,
  signInSchema,
  resetPasswordRequestSchema
} from './lib/authSchema'
