import Cookies from 'js-cookie'
import { IPermissionProject, Project } from '@/entities/Project'
import { IProjectPermissionRole } from '@/entities/Project/model/types/project.interface'
import {
  IAuthFormData,
  IResetPasswordRequestDto,
  IResetPasswordVerifyDto,
  ISetPasswordDto,
  IUser
} from '@/entities/User'
import {
  IAccessToken,
  IAuthResponse
} from '@/entities/User/model/types/user.interface'
import { IPermissionWorkspace, Workspace } from '@/entities/Workspace'
import { getContentType } from '@/shared/api/api.helpers'
import axios, { axiosClassic } from '@/shared/api/interceptors'
import { LocalStorageItems } from '@/shared/lib/helpers/local-storage.helper'
import { saveToStorage } from '../helpers/auth.helper'

const getAuthUrl = (string: string) => `/auth${string}`
export const AuthService = {
  async register(data: IAuthFormData): Promise<void> {
    await axiosClassic.post<IAuthResponse>(getAuthUrl('/register'), {
      ...data
    })
  },

  async login({
    email,
    password
  }: {
    email: string
    password: string
  }): Promise<IAuthResponse> {
    const response = await axiosClassic.post<IAuthResponse>(
      getAuthUrl('/login'),
      {
        email,
        password
      },
      {
        withCredentials: true
      }
    )
    if (response.data?.user) {
      saveToStorage(response.data)
    }
    return response.data
  },

  async logout(): Promise<void> {
    await axios.post(getAuthUrl('/logout'))
    localStorage.removeItem(LocalStorageItems.user)
    Cookies.remove(LocalStorageItems.refreshToken)
  },

  async getNewAccessToken(): Promise<IAccessToken> {
    const response = await axiosClassic.post<IAccessToken>(
      getAuthUrl('/refresh'),
      {},
      {
        withCredentials: true,
        headers: getContentType()
      }
    )
    return response.data
  },

  async updatePassword({
    password,
    newPassword
  }: {
    password: string
    newPassword: string
  }): Promise<void> {
    return await axios.patch(getAuthUrl('/update/password'), {
      password: password,
      newPassword: newPassword
    })
  },

  async getPermissionWorkspace(
    workspace: Workspace,
    user: IUser
  ): Promise<IPermissionWorkspace> {
    return (
      await axios.get(
        `/auth/permissions/workspace/${workspace.id}/user/${user.id}`
      )
    ).data
  },

  async getPermissionProject(
    project: Project,
    user: IUser
  ): Promise<IProjectPermissionRole> {
    const userPermissions = (
      await axios.get(`/auth/permissions/project/${project.id}/user/${user.id}`)
    ).data

    if (!userPermissions.permissions) {
      userPermissions.permissions = {} as IPermissionProject
    }

    return userPermissions
  },

  async getPermissionArchivedProject(
    project: Project,
    user: IUser
  ): Promise<IProjectPermissionRole> {
    const userPermissions = (
      await axios.get(
        `/auth/permissions/archived-project/${project.id}/user/${user.id}`
      )
    ).data

    if (!userPermissions.permissions) {
      userPermissions.permissions = {} as IPermissionProject
    }

    return userPermissions
  },

  isEmptyPermissions<P>(permissions?: P) {
    if (!permissions) {
      return true
    }

    for (const key in permissions) {
      if (permissions[key] !== undefined) {
        return false
      }
    }

    return true
  },

  async activateAccount(dto: {
    email: string
    code: string
  }): Promise<IAuthResponse> {
    const response = await axiosClassic.post<IAuthResponse>(
      getAuthUrl('/activate'),
      dto,
      { withCredentials: true }
    )

    if (response.data?.user) {
      saveToStorage(response.data)
    }

    return response.data
  },

  async resendActivationCode(email: string): Promise<void> {
    await axios.post(getAuthUrl('/resend/activation-code'), { email })
  },

  async resetPasswordRequest(dto: IResetPasswordRequestDto): Promise<void> {
    await axios.post(getAuthUrl('/password-reset/request'), dto)
  },

  async resetPasswordVerify(dto: IResetPasswordVerifyDto): Promise<void> {
    await axios.post(getAuthUrl('/password-reset/verify'), dto)
  },

  async setPassword(dto: ISetPasswordDto): Promise<IAuthResponse> {
    const response = await axios.post<IAuthResponse>(
      getAuthUrl('/password-reset/set'),
      dto,
      {
        withCredentials: true
      }
    )
    if (response.data?.user) {
      saveToStorage(response.data)
    }
    return response.data
  },

  async resendPasswordResetCode(email: string): Promise<void> {
    await axios.post(getAuthUrl('/password-reset/resend'), { email })
  }
}
