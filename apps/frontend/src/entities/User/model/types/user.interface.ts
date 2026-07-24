export interface IUser {
  id: number
  email: string
  username: string
  middleName?: string
  firstName: string
  lastName: string
  isAdmin: boolean
  isActivated: boolean
  iconBg: string
  iconFg: string
  dob?: Date
  sex?: string
  projectRole: 'admin' | 'controller' | 'assigner' | 'user' | 'guest'
  description?: string
  dateCreated: Date
  pendingEmail?: string
  phoneNumber?: string
  avatarId?: number
}

export interface UserFindQueryParams {
  query: string
  excludeProject?: number
  excludeWorkspaceAdmins?: number
  includeProject?: number
}

export interface IAuthResponse {
  accessToken: IAccessToken
  user: IUser
}

export interface IAccessToken {
  expiresIn: string
  token: string
}

export interface IUserProfileInfo {
  firstName: string
  lastName: string
  middleName?: string | null
  dob?: Date | null
  sex?: string | null
  description?: string | null
}

export interface IUpdateUserProfileDTO {
  firstName?: string
  lastName?: string
  middleName?: string
  dob?: Date
  sex?: string
  description?: string
  email?: string
  pendingEmail?: string
  phoneNumber?: string
  username?: string
  avatarId?: number
}

interface IUserRole {
  name: string
  code: string
}

export interface IObserverUser {
  id: number
  firstName: string
  lastName: string
  username: string
  avatarId?: number
}

export interface IObserver {
  user: IObserverUser
  role?: IUserRole
}
