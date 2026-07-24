import { AxiosError } from 'axios'

type ApiErrorDataResponse = {
  message?: string
}

export class CommonApiError {
  constructor(private readonly error: unknown) {}

  private isApiError(
    error: unknown
  ): error is AxiosError<ApiErrorDataResponse> {
    return error instanceof AxiosError
  }

  public errorCheck(status: number, message: string) {
    if (this.isApiError(this.error)) {
      return (
        this.error.response?.status === status &&
        this.error.response?.data?.message === message
      )
    }

    return false
  }
}

export class CommonClientError {
  constructor(private readonly error: unknown) {}

  private isClientError(error: unknown): error is Error {
    return error instanceof Error
  }

  public errorCheck(message: string): boolean {
    if (this.isClientError(this.error)) {
      return this.error.message === message
    }

    return false
  }
}
