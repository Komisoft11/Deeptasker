import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
import { settings } from '@/shared/config/route.config'
import { SUPPORT } from '@/shared/const/translation'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { SettingsNavigator } from '@/shared/lib/navigators/settings.navigator'
import { Button } from '@/shared/ui/Button/Button'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'


interface UseFeedbackToastOptions {
  userSignupDate: Date
}

const MIN_DAYS_AFTER_SIGNUP = 2
const SNOOZE_DAYS = 7 * 24 * 60 * 60 * 1000

export const useFeedbackToast = ({
  userSignupDate
}: UseFeedbackToastOptions) => {
  const { t, ready } = useTranslation([SUPPORT])
  const hasShownToastThisSession = useRef(false)

  const handleSnooze = () => {
    LocalStorageHelper.setFeedbackToastSnooze(Date.now() + SNOOZE_DAYS)
    toast.dismiss()
  }
  useEffect(() => {
    if (!ready) return
    if (hasShownToastThisSession.current) return
    const maybeShowToast = () => {
      if (LocalStorageHelper.hasUserLeftFeedback()) return
      if (LocalStorageHelper.getFeedbackToastShown()) return

      const snoozeUntil = LocalStorageHelper.getFeedbackToastSnooze()
      if (Date.now() < snoozeUntil) return

      const signupTime = new Date(userSignupDate).getTime()
      if (Date.now() - signupTime < MIN_DAYS_AFTER_SIGNUP * 24 * 60 * 60 * 1000)
        return

      showToast({
        className: '!items-start',
        title: t('feedback.toast.title', { ns: SUPPORT }),
        type: 'info',
        noAutoclose: true,
        link: {
          href: `/${SettingsNavigator.getSettingsUrl(settings.SUPPORT)}`,
          text: t('feedback.toast.text', { ns: SUPPORT }),
          onClick: () => {
            LocalStorageHelper.setFeedbackToastShown()
          }
        },
        children: (
          <Button
            styleButton={'filled'}
            colorButton={'dark'}
            className={'body-14-16 px-3 py-2'}
            onClick={handleSnooze}
          >
            {t('feedback.toast.snooze', { ns: SUPPORT })}
          </Button>
        )
      })
    }

    maybeShowToast()
    hasShownToastThisSession.current = true
  }, [userSignupDate, ready])
}
