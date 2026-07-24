import { IAccessToken } from './access-token.interface'

export interface ITokenPair {
	accessToken: IAccessToken
	refreshToken: string
}