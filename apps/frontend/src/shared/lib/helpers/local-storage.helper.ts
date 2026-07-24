import { Emoji } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/ui/EmojiPickerWithSearch/EmojiPickerWithSearch'
import { IUser } from '@/entities/User'
import { FREQUENT_EMOJIS } from '@/shared/const/local-storage'

interface IStorageItems {
  user: string
  accessToken: string
  themeMode: string
  refreshToken: string
  showSearch: string
  modePlanner: string
  isFirstLeftOpen: string
  isExtendedFirstLeftOpen: string
  isSecondLeftOpen: string
  isRightOpen: string
  cardSize: string
  pendingEmail: string
  isShowFinishedTasks: string
  editorDraftKey: (id: string | number) => string
  isShowId: string
  isShowGuidance: string
  feedbackToastShown: string
  feedbackToastSnooze: string
  userLeftFeedback: string
}

export const LocalStorageItems: IStorageItems = {
  user: 'user',
  themeMode: 'themeMode',
  accessToken: 'accessToken',
  refreshToken: 'refreshToken',
  showSearch: 'showSearch',
  modePlanner: 'modePlanner',
  isFirstLeftOpen: 'isFirstLeftOpen',
  isExtendedFirstLeftOpen: 'isExtendedFirstLeftOpen',
  isSecondLeftOpen: 'isSecondLeftOpen',
  isRightOpen: 'isRightOpen',
  cardSize: 'cardSize',
  pendingEmail: 'pendingEmail',
  isShowFinishedTasks: 'isShowFinishedTasks',
  editorDraftKey: (id: string | number) => `editorDraft_${id}`,
  isShowId: 'isShowId',
  isShowGuidance: 'isShowGuidance',
  feedbackToastShown: 'feedbackToastShown',
  feedbackToastSnooze: 'feedbackToastSnooze',
  userLeftFeedback: 'userLeftFeedback'
}

export type CardSize = 'L' | 'M' | 'S'

interface ISidebarState {
  isFirstLeftOpen: boolean
  isExtendedFirstLeftOpen: boolean
  isSecondLeftOpen: boolean
  isRightOpen: boolean
}

export function getStoreLocal<R extends Object>(name: string): R {
  const ls = localStorage.getItem(name)
  const value = ls ? JSON.parse(ls) : null
  if (value === 'true') {
    return true as R
  }

  if (value === 'false') {
    return false as R
  }

  return value
}

export const LocalStorageHelper = {
  getUser(): IUser {
    const user = getStoreLocal<IUser>(LocalStorageItems.user)
    if (!user?.firstName || !user?.lastName) {
      localStorage.removeItem(LocalStorageItems.user)
      throw new Error('Not found user in local storage')
    }
    if (!user) {
      throw new Error('Not found user in local storage')
    }
    return user
  },

  setUser(user: IUser): void {
    localStorage.setItem(LocalStorageItems.user, JSON.stringify(user))
  },

  removeUser(): void {
    localStorage.removeItem(LocalStorageItems.user)
  },

  getPendingEmail(): string {
    return localStorage.getItem(LocalStorageItems.pendingEmail) || ''
  },

  setPendingEmail(email: string): void {
    localStorage.setItem(LocalStorageItems.pendingEmail, email)
  },

  removePendingEmail(): void {
    localStorage.removeItem(LocalStorageItems.pendingEmail)
  },

  getThemeMode(): string {
    return localStorage.getItem(LocalStorageItems.themeMode) || 'dark'
  },

  setThemeMode(theme: string): void {
    localStorage.setItem(LocalStorageItems.themeMode, theme)
  },

  getIsShowId(): boolean {
    const value = localStorage.getItem(LocalStorageItems.isShowId)
    return value === 'true'
  },

  setIsShowId(isShowId: boolean): void {
    localStorage.setItem(LocalStorageItems.isShowId, isShowId.toString())
  },

  getCardSize(): string {
    return localStorage.getItem(LocalStorageItems.cardSize) || 'L'
  },

  setCardSize(cardSize: CardSize): void {
    localStorage.setItem(LocalStorageItems.cardSize, cardSize)
  },

  removeEditorDraft(id: string | number): void {
    localStorage.removeItem(LocalStorageItems.editorDraftKey(id))
  },

  getIsShowFinishedTasks(): boolean {
    return (
      localStorage.getItem(LocalStorageItems.isShowFinishedTasks) === 'true'
    )
  },

  setIsShowFinishedTasks(isShowFinishedTasks: boolean): void {
    localStorage.setItem(
      LocalStorageItems.isShowFinishedTasks,
      isShowFinishedTasks ? 'true' : 'false'
    )
  },

  clear(): void {
    const theme = this.getThemeMode()
    localStorage.clear()
    this.setThemeMode(theme)
  },

  setSidebarState(state: ISidebarState) {
    localStorage.removeItem('sidebarState')

    localStorage.setItem('sidebarState', JSON.stringify(state))
  },

  getSidebarState(): ISidebarState | null {
    return localStorage.getItem('sidebarState')
      ? (JSON.parse(
          localStorage.getItem('sidebarState') as string
        ) as ISidebarState)
      : null
  },

  getFrequentlyUsedEmojis(): Emoji[] {
    return (
      getStoreLocal<{ native: string; name: string }[]>(FREQUENT_EMOJIS) || []
    )
  },

  setFrequentlyUsedEmojis(emojis: { native: string; name: string }[]): void {
    localStorage.setItem(FREQUENT_EMOJIS, JSON.stringify(emojis))
  },

  setGuidanceVisible(value: boolean): void {
    localStorage.setItem(
      LocalStorageItems.isShowGuidance,
      value ? 'true' : 'false'
    )
  },

  getGuidanceVisible(): boolean {
    return getStoreLocal<boolean>(LocalStorageItems.isShowGuidance) ?? false
  },

  setGuidanceVisibleIfNotExists(): void {
    const existing = localStorage.getItem(LocalStorageItems.isShowGuidance)
    if (existing === null) {
      this.setGuidanceVisible(true)
    }
  },

  getFeedbackToastShown(): boolean {
    return localStorage.getItem(LocalStorageItems.feedbackToastShown) === 'true'
  },

  setFeedbackToastShown(): void {
    localStorage.setItem(LocalStorageItems.feedbackToastShown, 'true')
  },

  getFeedbackToastSnooze(): number {
    return Number(
      localStorage.getItem(LocalStorageItems.feedbackToastSnooze) || 0
    )
  },

  setFeedbackToastSnooze(snoozeUntil: number): void {
    localStorage.setItem(
      LocalStorageItems.feedbackToastSnooze,
      snoozeUntil.toString()
    )
  },

  hasUserLeftFeedback(): boolean {
    return localStorage.getItem(LocalStorageItems.userLeftFeedback) === 'true'
  },

  setUserLeftFeedback(): void {
    localStorage.setItem(LocalStorageItems.userLeftFeedback, 'true')
  }
}
