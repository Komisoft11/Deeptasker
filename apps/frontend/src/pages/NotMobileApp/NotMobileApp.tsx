import { useTranslation } from 'react-i18next'
import { Logo } from '@/features/Logo/Logo'
import { ENTITY } from '@/shared/const/translation'

export const NotMobileApp = () => {
  const { t } = useTranslation(ENTITY)
  return (
    <div className={'h-full flex items-center justify-center'}>
      <div
        className={'flex flex-col justify-between items-center h-[90%] px-4'}
      >
        <Logo className={'w-20 h-20'} />
        <div
          className={
            'flex flex-col items-center max-w-[550px] gap-4 text-center'
          }
        >
          <h2>{t('notMobileApp.title')}</h2>
          <p className={'body-14-20'}>{t('notMobileApp.description')}</p>
          <p className={'body-14-16'}>{t('notMobileApp.thankYou')}</p>
        </div>
        <div className={'w-20 h-20'}></div>
      </div>
    </div>
  )
}
