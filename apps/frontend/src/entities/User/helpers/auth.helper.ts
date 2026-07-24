import Cookies from 'js-cookie'
import { IAuthResponse } from '@/entities/User/model/types/user.interface'
import { LocalStorageItems } from '@/shared/lib/helpers/local-storage.helper'

export const saveToStorage = (response: IAuthResponse) => {
  localStorage.setItem(LocalStorageItems.user, JSON.stringify(response.user))
}

export const removeTokensStorage = () => {
  localStorage.removeItem(LocalStorageItems.user)
  Cookies.remove(LocalStorageItems.accessToken)
  Cookies.remove(LocalStorageItems.refreshToken)
}
