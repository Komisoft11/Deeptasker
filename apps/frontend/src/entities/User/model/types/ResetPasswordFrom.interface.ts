import { IAuthFormData } from '@/entities/User'

export interface IResetPasswordRequestDto
  extends Pick<IAuthFormData, 'email'> {}

export interface IResetPasswordVerifyDto extends Pick<IAuthFormData, 'email'> {
  code: string
}

export interface ISetPasswordDto
  extends Pick<IAuthFormData, 'email' | 'password'> {
  code: string
}

export type setPasswordFrom = Pick<ISetPasswordDto, 'password'> & {
  copyPassword: string
}
