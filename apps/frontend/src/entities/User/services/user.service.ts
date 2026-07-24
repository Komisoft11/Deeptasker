import { IUser, IUserProfileInfo, UserFindQueryParams } from '@/entities/User'
import {
  IObserverUser,
  IUpdateUserProfileDTO
} from '@/entities/User/model/types/user.interface'
import axios from '@/shared/api/interceptors'

const getUserUrl = (string: string) => `/users${string}`

export const UserService = {
  async getUser(id: number): Promise<IUser> {
    return (await axios.get(getUserUrl(`/${id}`))).data
  },
  async find(params: UserFindQueryParams): Promise<IUser[]> {
    return (
      await axios.get(getUserUrl('/find'), {
        params
      })
    ).data
  },

  async findInProject(
    query: string,
    projectId: number,
    userIds?: number[]
  ): Promise<IUser[]> {
    return (
      await axios.get(
        getUserUrl(`/find/?query=${query}&includeProject=${projectId}`),
        {
          params: {
            userIds: userIds?.join(',')
          }
        }
      )
    ).data
  },
  getFullName(user: IUser | IObserverUser): string {
    return `${user.firstName} ${user.lastName}`
  },
  async updateInformation(
    userInfo: IUpdateUserProfileDTO
  ): Promise<IUserProfileInfo> {
    return (await axios.patch(getUserUrl('/update'), userInfo)).data
  },
  async getProfile(): Promise<IUser> {
    return (await axios.get(getUserUrl(`/profile`))).data
  },
  async checkUsername(username: string): Promise<boolean> {
    return (
      await axios.post(getUserUrl(`/check-username`), { username: username })
    ).data
  },

  async requestUpdateEmail({
    email,
    previousEmail
  }: {
    email: string
    previousEmail: string
  }): Promise<void> {
    return await axios.post(getUserUrl('/update-email/request'), {
      email: email,
      previousEmail: previousEmail
    })
  },

  async verifyUpdateEmail({ code }: { code: string }): Promise<void> {
    return await axios.post(getUserUrl('/update-email/verify'), {
      code: code
    })
  },
  async resendRequestUpdateEmail(): Promise<void> {
    return await axios.post(getUserUrl('/update-email/resend-request'))
  },

  async cancelUpdateEmail(): Promise<void> {
    return await axios.post(getUserUrl('/update-email/cancel'))
  },

  async deleteAccount({
    code,
    password
  }: {
    code?: string
    password?: string
  }): Promise<void> {
    return await axios.post(getUserUrl('/delete'), {
      code: code,
      password: password
    })
  },

  async requestCodeForAccountDelete(): Promise<void> {
    return await axios.post(getUserUrl('/delete/request'))
  }
}
