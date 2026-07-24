import { makeAutoObservable } from 'mobx'
import { SidebarStore } from '@/entities/Sidebar'
import { AuthService, IAuthResponse } from '@/entities/User'
import { IUpdateUserProfileDTO, IUser } from '@/entities/User/model/types/user.interface'
import { UserService } from '@/entities/User/services/user.service'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { SessionStorageHelper } from '@/shared/lib/helpers/session-storage.helper'

export class AuthStore {
  private _user: IUser = {} as IUser
  private _candidateEmail: string | null = null
  private _isAuth: boolean = false
  private _enteredResetCode: string | null = null
  private _isAppInitialization: boolean = false
  private readonly _sidebarStore: SidebarStore

  constructor(sidebarStore: SidebarStore) {
    makeAutoObservable(this)
    this._sidebarStore = sidebarStore
    this.checkAuth()
  }

  public checkAuth = () => {
    let user = undefined
    try {
      user = LocalStorageHelper.getUser()
    } catch (e) {}
    if (user) {
      this.updateIfAuth(user)
      if (user.isActivated) {
        this.setAuth(true)
      }
    } else {
      this.setAuth(false)
    }
  }

  public async init(): Promise<void> {
    try {
      const profile = await this.fetchProfile()

      this.updateIfAuth(profile)

      if (profile.isActivated) {
        this.setAuth(true)
      }

      LocalStorageHelper.setGuidanceVisibleIfNotExists()

      const isVisible = LocalStorageHelper.getGuidanceVisible()
      if (isVisible) {
        this._sidebarStore.openLeftSecondSidebar()
        this._sidebarStore.extendLeftFirstSidebar()
      }
    } catch (e) {
      this.setAuth(false)
      this.clear()
    }
  }

  public login = ({
    response,
    userInfo
  }: {
    response: IAuthResponse
    userInfo: IUser
  }): void => {
    const user = Object.assign(response.user, userInfo)
    this.updateIfAuth(user)
    if (user.isActivated) {
      this.setAuth(true)
    }
    this._candidateEmail = null
  }

  public logout = async () => {
    try {
      await AuthService.logout()
      this.clear()
    } catch (e) {
      console.log(e.response?.data?.message)
    }
  }

  public updateInformation = (userInfo: IUpdateUserProfileDTO): void => {
    let copyUser = { ...this.user }
    copyUser = Object.assign(copyUser, userInfo)
    this.updateIfAuth(copyUser)
  }

  public setAuth(auth: boolean) {
    this._isAuth = auth
  }

  public clearEnteredResetCode = () => {
    this._enteredResetCode = null
  }

  public clear() {
    this.user = {} as IUser
    this.setAuth(false)
    this.isAppInitialization = false
    this._candidateEmail = null
    LocalStorageHelper.clear()
    SessionStorageHelper.clear()
  }

  private updateIfAuth(user: IUser): void {
    user.dob = user.dob ? new Date(user.dob) : undefined
    if (user.dob) {
      user.dob.setUTCHours(12)
      user.dob.setUTCMinutes(0)
    }
    this.user = user
    LocalStorageHelper.setUser(user)
  }

  private async fetchProfile(): Promise<IUser> {
    return UserService.getProfile()
  }

  get isAuth(): boolean {
    return this._isAuth
  }

  set isAuth(value: boolean) {
    this._isAuth = value
  }

  get user(): IUser {
    return this._user
  }

  set user(value: IUser) {
    this._user = value
  }

  get isAppInitialization(): boolean {
    return this._isAppInitialization
  }

  set isAppInitialization(isInitializing: boolean) {
    this._isAppInitialization = isInitializing
  }

  get candidateEmail(): string | null {
    return this._candidateEmail
  }

  set candidateEmail(email: string) {
    this._candidateEmail = email
  }

  set enteredResetCode(value: string) {
    this._enteredResetCode = value
  }

  get enteredResetCode(): string | null {
    return this._enteredResetCode
  }
}