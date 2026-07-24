import classNames from 'classnames'
import i18next from 'i18next'
import { FC, ReactNode } from 'react'
import {
  ToastContainer,
  ToastOptions,
  cssTransition,
  toast
} from 'react-toastify'
import { Id } from 'react-toastify/dist/types'
import {
  Bug,
  Close,
  Help,
  Success,
  Warning
} from '@/shared/assets/images/icons'
import { settings } from '@/shared/config/route.config'
import { SUPPORT } from '@/shared/const/translation'
import { SettingsNavigator } from '@/shared/lib/navigators/settings.navigator'
import styles from './ToastNotification.module.scss'

type ToastType = 'success' | 'warning' | 'error' | 'info'

type Link = {
  href: string
  text: string
  onClick?: () => void
}

export interface ToastConfig {
  title: string
  type: ToastType
  options?: ToastOptions
  text?: string
  link?: Link
  noAutoclose?: boolean
  handleBugClick?: () => void
  children?: ReactNode
  className?: string
}

const ZoomEnterNoExit = cssTransition({
  enter: styles.slideEnter,
  exit: styles.instantExit
})

const getOutlineColor = (type: ToastType) => {
  const outlineColors = {
    success: 'var(--system-green)',
    error: 'var(--system-red)',
    warning: 'var(--system-yellow)',
    info: 'var(--accent-60)'
  }
  return outlineColors[type] || ''
}

const getToastIcon = (type: ToastType) => {
  const icons = {
    success: <Success className={classNames(styles.icon, 'iconGreen')} />,
    warning: <Warning className={styles.icon} />,
    error: <Bug className={classNames(styles.icon, 'iconRed')} />,
    info: <Help className={classNames(styles.icon, 'iconAccent')} />
  }
  return icons[type] || null
}

export const showToast = ({
  title,
  type,
  options,
  text,
  link,
  noAutoclose,
  children,
  className
}: ToastConfig): Id => {
  const isError = type === 'error'
  const withFooter = link || children
  const content = (
    <div
      className={classNames(
        styles.toastContent,
        className,
        isError && '!items-start'
      )}
    >
      <div className={'p-[2px]'}>{getToastIcon(type)}</div>
      <div className={styles.messageContainer}>
        <h4 className={styles.title}>{title}</h4>
        {text && <p className={'body-14-20 secondaryText'}>{text}</p>}
        {isError && (
          <a
            href={`/${SettingsNavigator.getSettingsUrl(settings.SUPPORT)}`}
            className={'body-12 px-3 py-2 bg-hover w-max rounded-lg'}
          >
            {i18next.t('bugReport.title', {
              ns: SUPPORT
            })}
          </a>
        )}
        {withFooter && (
          <div className={'flex gap-2 items-center mt-1'}>
            {link && (
              <a
                href={link.href}
                className={
                  'bg-hover hover:opacity-70 px-3 py-2 body-14-16 w-max rounded-lg hover:cursor-pointer'
                }
                onClick={link.onClick}
              >
                {link.text}
              </a>
            )}
            {children && children}
          </div>
        )}
      </div>
    </div>
  )

  return toast(content, {
    position: 'bottom-right',
    autoClose: noAutoclose ? false : 3500,
    hideProgressBar: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: styles.toastContainer,
    bodyClassName: styles.toastContent,
    closeButton: <CloseButton />,
    transition: ZoomEnterNoExit,
    style: {
      outline: `1px solid ${getOutlineColor(type)}`
    },
    ...options
  })
}

const CloseButton = () => (
  <div className={'iconContainer h-max'}>
    <Close className={'icon h-4 w-4'} />
  </div>
)

export const ToastNotification: FC = () => {
  return <ToastContainer className={styles.toast} />
}
