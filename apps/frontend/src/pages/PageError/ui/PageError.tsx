import classNames from 'classnames'
import { useTranslation } from 'react-i18next'
import { nsObject } from '@/shared/lib/helpers/translation.helper'
import { Button } from '@/shared/ui/Button/Button'
import cls from './PageError.module.scss'

interface PageErrorProps {
  className?: string
}

export const PageError = ({ className }: PageErrorProps) => {
  const { t } = useTranslation()

  const reloadPage = () => {
    window.location.reload()
  }

  return (
    <div className={classNames(cls.PageError, {}, [className])}>
      <p>{t('error.somethingWentWrong', nsObject())}</p>
      <Button styleButton={'filled'} onClick={reloadPage}>
        Reload page
      </Button>
    </div>
  )
}
