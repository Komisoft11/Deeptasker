import { makeAutoObservable } from 'mobx'
import { ContainerNameView, ElementNameView } from '@/entities/Sidebar/model/types/sidebar.interface'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'

export class SidebarStore {
  private _isFirstLeftOpen: boolean = true
  private _isExtendedFirstLeftOpen: boolean = true
  private _isSecondLeftOpen: boolean = true
  private _isRightOpen: boolean = false
  private _elementView: ElementNameView = 'project'
  private _viewContainer: ContainerNameView = 'tasks'

  constructor() {
    makeAutoObservable(this)
    const state = LocalStorageHelper.getSidebarState()
    if (state) {
      this._isFirstLeftOpen = state.isFirstLeftOpen
      this._isExtendedFirstLeftOpen = state.isExtendedFirstLeftOpen
      this._isSecondLeftOpen = state.isSecondLeftOpen
      this._isRightOpen = state.isRightOpen
    }
  }

  get isRightOpen(): boolean {
    return this._isRightOpen
  }

  get elementView(): ElementNameView {
    return this._elementView
  }

  set elementView(value: ElementNameView) {
    this._elementView = value
  }

  get isSecondLeftOpen(): boolean {
    return this._isSecondLeftOpen
  }

  get isFirstLeftOpen(): boolean {
    return this._isFirstLeftOpen
  }

  get isExtendedFirstLeftOpen(): boolean {
    return this._isExtendedFirstLeftOpen
  }

  get viewContainer(): ContainerNameView {
    return this._viewContainer
  }

  set viewContainer(view: ContainerNameView) {
    this._viewContainer = view
  }

  public collapseLeftFirstSidebar() {
    this._isExtendedFirstLeftOpen = false
    this.setSidebarStateInLocalStorage()
  }

  public extendLeftFirstSidebar() {
    this._isExtendedFirstLeftOpen = true
    this.setSidebarStateInLocalStorage()
  }

  public openLeftSecondSidebar() {
    this._isSecondLeftOpen = true
    this._isRightOpen = false
    this.setSidebarStateInLocalStorage()
  }

  public closeLeftSecondSidebar() {
    this._isSecondLeftOpen = false
    this.setSidebarStateInLocalStorage()
  }

  public openRightSidebar() {
    this._isRightOpen = true
    this._isSecondLeftOpen = false
    this.setSidebarStateInLocalStorage()
  }

  public closeRightSidebar() {
    this._isRightOpen = false
    this.setSidebarStateInLocalStorage()
  }

  get isExtendedTable(): boolean {
    return !this._isSecondLeftOpen && !this._isRightOpen
  }

  toggleSecondLeft(view: ElementNameView) {
    if (this._elementView === view) {
      this._isSecondLeftOpen = !this._isSecondLeftOpen

      if (this._isSecondLeftOpen) {
        this._isRightOpen = false
      }
    } else {
      this._isSecondLeftOpen = true
      this._elementView = view
    }

    this.setSidebarStateInLocalStorage()
  }

  private setSidebarStateInLocalStorage() {
    LocalStorageHelper.setSidebarState({
      isFirstLeftOpen: this._isFirstLeftOpen,
      isExtendedFirstLeftOpen: this._isExtendedFirstLeftOpen,
      isSecondLeftOpen: this._isSecondLeftOpen,
      isRightOpen: this._isRightOpen
    })
  }
}