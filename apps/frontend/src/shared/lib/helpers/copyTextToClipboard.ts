import i18next from 'i18next'
import { ERRORS, SUCCESS } from '@/shared/const/translation'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'

export const copyTextToClipboard = async (
  text: string,
  successMessageKey?: string
) => {
  try {
    if (!navigator?.clipboard?.writeText) {
      showToast({
        title: i18next.t('clipboard.notSupported', { ns: ERRORS }),
        type: 'error'
      })
      return
    }

    await navigator.clipboard.writeText(text)

    showToast({
      title:
        successMessageKey ?? i18next.t('clipboard.copied', { ns: SUCCESS }),
      type: 'success'
    })
  } catch (error) {
    showToast({
      title: i18next.t('clipboard.copyError', { ns: ERRORS }),
      type: 'error'
    })
  }
}
