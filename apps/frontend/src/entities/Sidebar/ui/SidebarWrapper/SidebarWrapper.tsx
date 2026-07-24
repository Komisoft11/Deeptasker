import classNames from 'classnames'
import React, { FC, ReactNode, useEffect, useState } from 'react'
import styles from './SidebarWrapper.module.scss'

interface Props {
  children?: ReactNode
  isVisible?: boolean
}

export const SidebarWrapper: FC<Props> = ({ children, isVisible }) => {
  const [shouldRender, setShouldRender] = useState(isVisible)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
    } else {
      const timeout = setTimeout(() => setShouldRender(false), 300)
      return () => clearTimeout(timeout)
    }
  }, [isVisible])

  if (!shouldRender) return null

  return (
    <div
      className={classNames(
        styles.wrapper,
        isVisible ? styles.visible : styles.hidden
      )}
    >
      {children}
    </div>
  )
}