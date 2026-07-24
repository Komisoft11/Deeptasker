import { INTERNAL_SERVER_ERROR } from '@/shared/config/api.config'

export interface IError {
  message?: string
  code: number
}

export const errorCatch = (error: any): IError =>
  error.response && error.response.data
    ? typeof error.response.data.message === 'object'
      ? { message: error.response.data.message[0], code: error.response.status }
      : { message: error.response.data.message, code: error.response.status }
    : { message: error.message, code: INTERNAL_SERVER_ERROR }

export const getContentType = () => ({
  'Content-Type': 'application/json'
})
