import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { useVerificationTimer } from '@/features/User/VerificationForm/hooks/useVerificationTimer'
import { TRANSLATION } from '@/shared/const/translation'

interface Props {
  onClick: () => void
}

export const VerificationTimer: FC<Props> = observer(({ onClick }) => {
  const { timeLeft, isTimerDone, formatTime, resetTimer } =
    useVerificationTimer()
  const { t } = useTranslation(TRANSLATION)

  const handleClick = () => {
    resetTimer()
    onClick()
  }

  return (
    <div className={'body-12'}>
      {isTimerDone ? (
        <p
          className={'text-accent hover:cursor-pointer hover:opacity-80'}
          onClick={handleClick}
        >
          {t('resendCode')}
        </p>
      ) : (
        <p className={'flex secondaryText gap-1'}>
          {t('didNotReceiveCode')}
          <span className={'text-accent'}>{formatTime(timeLeft)}</span>
        </p>
      )}
    </div>
  )
})
