import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { ArrowLeft, Sidebar } from '@/shared/assets/images/icons'
import { TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { KbdElement } from '@/shared/ui/KbdElement/KbdElement'
import styles from './Header.module.scss'


interface Props {
  title: string | ReactNode
  navigateUrlToBack?: string | number
  children?: ReactNode
  withProjectSidebarOpen?: boolean
  withBreadcrumbs?: boolean
  className?: string
  mainInfoClassName?: string
}

export const Header = observer(
  ({
    title,
    navigateUrlToBack,
    children,
    withProjectSidebarOpen = false,
    withBreadcrumbs = false,
    className,
    mainInfoClassName
  }: Props) => {
    const navigate = useNavigate()
    const { t } = useTranslation(TRANSLATION)
    const { sidebarStore } = useRootStore()

    const isProjectSidebarOpen = sidebarStore.isSecondLeftOpen

    const handleClickBack = () => {
      if (typeof navigateUrlToBack === 'number') {
        navigate(navigateUrlToBack)
      } else if (navigateUrlToBack) {
        navigate(navigateUrlToBack)
      }
    }

    const renderBackButton = () => (
      <div className='iconContainer h-max bg-hover' onClick={handleClickBack}>
        <KbdElement
          kdb={<ArrowLeft className={'icon w-4 h-4'} />}
          tooltipContent={t('back')}
          className='!p-0'
          side='bottom'
        />
      </div>
    )

    const renderProjectSidebarToggle = () => (
      <div
        className={classNames(
          'p-[6px] hover:cursor-pointer hover:bg-hover rounded-lg h-max',
          isProjectSidebarOpen && 'bg-hover'
        )}
        onClick={() => sidebarStore.toggleSecondLeft('project')}
      >
        <KbdElement
          kdb={<Sidebar className={'icon w-5 h-5'} />}
          tooltipContent={
            isProjectSidebarOpen
              ? 'Скрыть список проектов'
              : 'Раскрыть список проектов'
          }
          className='!p-0'
          side='bottom'
        />
      </div>
    )

    const titleClassName = classNames(
      'h-full',
      !navigateUrlToBack && !withProjectSidebarOpen && 'w-full'
    )

    return (
      <div className={classNames(styles.header, className)}>
        <div
          className={classNames(
            'flex gap-2 w-full items-center',
            mainInfoClassName
          )}
        >
          {navigateUrlToBack && renderBackButton()}
          {!navigateUrlToBack &&
            withProjectSidebarOpen &&
            renderProjectSidebarToggle()}
          {withBreadcrumbs ? (
            <div className={titleClassName}> {title} </div>
          ) : (
            <h3 className={titleClassName}> {title}</h3>
          )}
        </div>
        {children}
      </div>
    )
  }
)
