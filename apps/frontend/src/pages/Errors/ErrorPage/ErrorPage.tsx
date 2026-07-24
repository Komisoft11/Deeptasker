import { useTranslation } from 'react-i18next'
import { Logo } from '@/features/Logo/Logo'
import { TRANSLATION } from '@/shared/const/translation'
import { Button } from '@/shared/ui/Button/Button'
import styles from './ErrorPage.module.scss'

interface Props {
  title: string
  description: string
  buttonText: string
  code: string
  onClick: () => void
}

export const ErrorPage = ({
  title,
  description,
  buttonText,
  code,
  onClick
}: Props) => {
  const { t } = useTranslation(TRANSLATION)

  const mail = import.meta.env.VITE_SUPPORT_EMAIL

  const handleContactSupport = () => {
    window.location.href = `mailto:${mail}?subject=Помощь`
  }

  return (
    <div className={'flex flex-col px-[64px] py-8'}>
      <Logo className={'w-11 h-11'} />
      <div className={'flex flex-col gap-12 mt-[160px]'}>
        <div className={'flex flex-col gap-6'}>
          <h1 className={'!text-[92px] !leading-[100px] lowercase'}>{title}</h1>
          <p className={'body-20 secondaryText'}>{description}</p>
        </div>

        <div className={'flex gap-2'}>
          <Button
            styleButton={'filled'}
            colorButton={'dark'}
            className={'px-4 body-16'}
            onClick={handleContactSupport}
          >
            {t('contactSupport')}
          </Button>
          <Button
            styleButton={'filled'}
            className={'px-4 body-16'}
            onClick={onClick}
          >
            {buttonText}
          </Button>
        </div>
      </div>
      <p className={styles.code}>{code}</p>
    </div>
  )
}
