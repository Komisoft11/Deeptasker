import { IAccessToken } from './access-token.interface'

export interface ILoginResponse {
  accessToken: IAccessToken
  user: {
    id: number
    email: string
    username: string
    firstName: string
    lastName: string
    iconBg: string
    iconFg: string
    isActivated: boolean
    avatarId: number
  }
}
