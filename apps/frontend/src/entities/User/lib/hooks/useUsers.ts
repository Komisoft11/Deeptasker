import { UseMutationResult } from '@tanstack/react-query/src/types'
import { useNavigate } from 'react-router'
import { AuthApiError } from '@/entities/Error'
import { IAvatar } from '@/entities/File/model/types/file.interface'
import { FileService } from '@/entities/File/services/file.service'
import {
  AuthService,
  IAuthFormData,
  IAuthResponse,
  IResetPasswordRequestDto,
  IResetPasswordVerifyDto,
  ISetPasswordDto,
  IUser,
  IUserProfileInfo
} from '@/entities/User'
import { IUpdateUserProfileDTO } from '@/entities/User/model/types/user.interface'
import { UserService } from '@/entities/User/services/user.service'
import { useCreateMutation } from '@/entities/lib/useCreateMutation'
import { INIT_URL } from '@/shared/config/route.config'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { AuthenticationNavigator } from '@/shared/lib/navigators/authentication.navigator'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'

interface IReturn {
  loginAsync: UseMutationResult<
    { response: IAuthResponse; userInfo: IUser },
    unknown,
    { email: string; password: string }
  >
  registrationAsync: UseMutationResult<void, unknown, IAuthFormData>
  updateInformationAsync: UseMutationResult<
    IUserProfileInfo,
    unknown,
    IUpdateUserProfileDTO
  >
  activateAsync: UseMutationResult<
    { response: IAuthResponse; userInfo: IUser },
    unknown,
    { email: string; code: string }
  >
  resetPasswordRequestAsync: UseMutationResult<
    void,
    unknown,
    IResetPasswordRequestDto
  >
  resetPasswordVerifyAsync: UseMutationResult<
    void,
    unknown,
    IResetPasswordVerifyDto
  >
  setPasswordAsync: UseMutationResult<
    { response: IAuthResponse; userInfo: IUser },
    unknown,
    ISetPasswordDto
  >
  updateAvatar: UseMutationResult<IAvatar, unknown, FormData>
  deleteAvatar: UseMutationResult<void, unknown, number>
  updatePasswordAsync: UseMutationResult<
    void,
    unknown,
    { password: string; newPassword: string }
  >
  verifyEmailAsync: UseMutationResult<void, unknown, { code: string }>
  requestUpdateEmailAsync: UseMutationResult<
    void,
    unknown,
    { email: string; previousEmail: string }
  >
  cancelVerifyEmailAsync: UseMutationResult<void, unknown, void>
  deleteAccountAsync: UseMutationResult<
    void,
    unknown,
    { code?: string; password?: string }
  >
}

export const useUsers = (): IReturn => {
  const navigate = useNavigate()
  const { authStore } = useRootStore()

  const loginAsync = useCreateMutation<
    { response: IAuthResponse; userInfo: IUser },
    unknown,
    { email: string; password: string }
  >({
    mutationKey: ['login'],
    mutationFn: async (dto) => {
      const response = await AuthService.login(dto)
      const userInfo = await UserService.getProfile()
      return { response, userInfo }
    },
    onSuccess: async (data) => {
      authStore.login(data)
      navigate(INIT_URL)
    },
    onError: (e, dto) => {
      const error = new AuthApiError(e)

      if (error.isNotActivatedUser()) {
        authStore.candidateEmail = dto.email
        navigate(AuthenticationNavigator.getActivationUrl())
      }
    }
  })

  const registrationAsync = useCreateMutation<void, unknown, IAuthFormData>({
    mutationKey: ['registration'],
    mutationFn: AuthService.register,
    onSuccess: async (_, data) => {
      authStore.candidateEmail = data.email
      navigate(AuthenticationNavigator.getActivationUrl())
    }
  })

  const activateAsync = useCreateMutation<
    { response: IAuthResponse; userInfo: IUser },
    unknown,
    { email: string; code: string }
  >({
    mutationKey: ['activate'],
    mutationFn: async (dto) => {
      const response = await AuthService.activateAccount(dto)
      const userInfo = await UserService.getProfile()
      return { response, userInfo }
    },
    onSuccess: async (data) => {
      authStore.login(data)
      LocalStorageHelper.setGuidanceVisible(true)
      navigate(INIT_URL)
    }
  })

  const updateInformationAsync = useCreateMutation<
    IUserProfileInfo,
    unknown,
    IUpdateUserProfileDTO
  >({
    mutationKey: ['update'],
    mutationFn: UserService.updateInformation,
    onSuccess: async (_, variables) => {
      authStore.updateInformation(variables)

      showToast({
        title: 'Данные пользователя изменены успешно',
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: 'Ошибка при изменении данных пользователя',
        type: 'error'
      })
    }
  })

  const updateAvatar = useCreateMutation<IAvatar, unknown, FormData>({
    mutationKey: ['update avatar'],
    mutationFn: FileService.uploadAvatar,
    onSuccess: async (data) => {
      authStore.updateInformation({ avatarId: data.id })

      showToast({
        title: 'Аватар пользователя успешно изменён',
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: 'Ошибка при изменении аватара',
        type: 'error'
      })
    }
  })

  const deleteAvatar = useCreateMutation<void, unknown, number>({
    mutationKey: ['delete avatar'],
    mutationFn: FileService.deleteAvatar,
    onSuccess: async () => {
      authStore.updateInformation({ avatarId: undefined })

      showToast({
        title: 'Аватар пользователя успешно удалён',
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: 'Ошибка при удалении аватара',
        type: 'error'
      })
    }
  })

  const resetPasswordRequestAsync = useCreateMutation<
    void,
    unknown,
    IResetPasswordRequestDto
  >({
    mutationKey: ['reset request'],
    mutationFn: AuthService.resetPasswordRequest,
    onSuccess: async (_, variables) => {
      authStore.candidateEmail = variables.email
      navigate(AuthenticationNavigator.getResetPasswordVerifyUrl())
    }
  })

  const resetPasswordVerifyAsync = useCreateMutation<
    void,
    unknown,
    IResetPasswordVerifyDto
  >({
    mutationKey: ['reset verify'],
    mutationFn: AuthService.resetPasswordVerify,
    onSuccess: (_, dto) => {
      authStore.enteredResetCode = dto.code
      navigate(AuthenticationNavigator.getSetPasswordUrl())
    }
  })

  const setPasswordAsync = useCreateMutation<
    { response: IAuthResponse; userInfo: IUser },
    unknown,
    ISetPasswordDto
  >({
    mutationKey: ['reset set'],
    mutationFn: async (dto) => {
      const response = await AuthService.setPassword(dto)
      const userInfo = await UserService.getProfile()
      return { response, userInfo }
    },
    onSuccess: async (data) => {
      authStore.clearEnteredResetCode()
      authStore.login(data)
      navigate(INIT_URL)
    },
    onError: (e, dto) => {
      const error = new AuthApiError(e)

      if (error.isNotActivatedUser()) {
        authStore.candidateEmail = dto.email
        navigate(AuthenticationNavigator.getActivationUrl())
      }
    }
  })

  const updatePasswordAsync = useCreateMutation<
    void,
    unknown,
    { password: string; newPassword: string }
  >({
    mutationKey: ['update password'],
    mutationFn: AuthService.updatePassword,
    onSuccess: () => {
      showToast({
        title: 'Пароль пользователя успешно изменён',
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: 'Ошибка при изменении пароля пользователя',
        type: 'error'
      })
    }
  })

  const requestUpdateEmailAsync = useCreateMutation<
    void,
    unknown,
    { email: string; previousEmail: string }
  >({
    mutationKey: ['request update email'],
    mutationFn: UserService.requestUpdateEmail,
    onSuccess: (_, variables) => {
      LocalStorageHelper.setPendingEmail(variables.email)
      authStore.updateInformation({ pendingEmail: variables.email })
      showToast({
        title: 'Запрос на изменение email пользователя успешно отправлен',
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: 'Ошибка при запросе изменения Email пользователя',
        type: 'error'
      })
    }
  })

  const verifyEmailAsync = useCreateMutation<void, unknown, { code: string }>({
    mutationKey: ['verify update email'],
    mutationFn: UserService.verifyUpdateEmail,
    onSuccess: () => {
      const newEmail = authStore.user.pendingEmail
      authStore.updateInformation({ email: newEmail, pendingEmail: undefined })
      LocalStorageHelper.removePendingEmail()
      showToast({
        title: 'Email пользователя успешно изменён',
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: 'Ошибка при изменении Email пользователя',
        type: 'error'
      })
    }
  })

  const cancelVerifyEmailAsync = useCreateMutation<void, unknown, void>({
    mutationKey: ['cancel update email'],
    mutationFn: UserService.cancelUpdateEmail,
    onSuccess: () => {
      LocalStorageHelper.removePendingEmail()
      authStore.updateInformation({ pendingEmail: undefined })
      showToast({
        title: 'Процесс изменение email успешно остановлен',
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: 'Ошибка при попытке остановки процесса изменения email',
        type: 'error'
      })
    }
  })

  const deleteAccountAsync = useCreateMutation<
    void,
    unknown,
    { code?: string; password?: string }
  >({
    mutationKey: ['deleteAccount'],
    mutationFn: UserService.deleteAccount,
    onSuccess: async () => {
      authStore.clear()
      showToast({
        title: 'Пользователь успешно удалён',
        type: 'success'
      })
    },
    onError: () => {
      showToast({
        title: 'Ошибка при попытке удаления пользователя',
        type: 'error'
      })
    }
  })

  return {
    loginAsync,
    registrationAsync,
    updateInformationAsync,
    activateAsync,
    resetPasswordRequestAsync,
    resetPasswordVerifyAsync,
    setPasswordAsync,
    updatePasswordAsync,
    verifyEmailAsync,
    requestUpdateEmailAsync,
    cancelVerifyEmailAsync,
    deleteAccountAsync,
    updateAvatar,
    deleteAvatar
  }
}
