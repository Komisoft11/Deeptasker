import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { ReactNode } from 'react'
import { NavLink } from 'react-router'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import styles from './MenuItem.module.scss'

interface Props {
  to?: string
  children?: ReactNode
  className?: string
  onClick?: () => void
  icon?: ReactNode
  title: string
  disabled?: boolean
  isSidebarCollapsed: boolean
  isActive?: boolean
}

export const MenuItem = observer(
  ({
    className,
    children,
    to,
    icon,
    title,
    disabled = false,
    isSidebarCollapsed,
    onClick,
    isActive,
    ...props
  }: Props) => {
    const { sidebarStore } = useRootStore()

    const handleClick = () => {
      onClick?.()
      sidebarStore.closeRightSidebar()
    }

    const renderContent = () => (
      <>
        {children}
        {icon && <div className={styles.iconWrap}>{icon}</div>}
        {!isSidebarCollapsed && (
          <p className={classNames('body-14-16 ellipsis')}>{title}</p>
        )}
      </>
    )

    const commonClasses = classNames(
      styles.item,
      className,
      children && !isSidebarCollapsed && 'gap-2 p-2',
      children && isSidebarCollapsed && 'py-2 px-[6px]',
      isSidebarCollapsed && !children && 'p-1 justify-center',
      disabled && 'disabled-30'
    )

    if (disabled) {
      return to ? (
        <div className={commonClasses} {...props}>
          {renderContent()}
        </div>
      ) : (
        <div className={commonClasses} {...props}>
          {icon && <div className={styles.iconWrap}>{icon}</div>}
          {!isSidebarCollapsed && <p className={'body-14-16'}>{title}</p>}
        </div>
      )
    }

    return to ? (
      <NavLink
        to={to}
        className={({ isActive: isActiveProp }) =>
          classNames(commonClasses, (isActiveProp || isActive) && styles.active)
        }
        onClick={handleClick}
        {...props}
      >
        {renderContent()}
      </NavLink>
    ) : (
      <button className={commonClasses} onClick={handleClick} {...props}>
        {renderContent()}
      </button>
    )
  }
)
