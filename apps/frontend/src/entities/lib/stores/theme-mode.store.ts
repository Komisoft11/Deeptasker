import { makeAutoObservable } from 'mobx'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'


export enum ThemeType {
  light = 'light',
  dark = 'dark'
}

class ThemeModeStore {
  private _mode: ThemeType =
    (LocalStorageHelper.getThemeMode() as ThemeType) || ThemeType.light

  constructor() {
    makeAutoObservable(this)
  }

  get mode(): ThemeType {
    return this._mode
  }

  set mode(value: ThemeType) {
    this._mode = value
  }

  init() {
    this._mode =
      (LocalStorageHelper.getThemeMode() as ThemeType) || ThemeType.light
  }
}

export default ThemeModeStore
