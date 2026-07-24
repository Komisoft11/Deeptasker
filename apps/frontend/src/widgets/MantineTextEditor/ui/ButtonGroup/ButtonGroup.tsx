import classNames from 'classnames'
import React, { FC, ReactNode } from 'react'
import { TextEditorMode } from '@/widgets/MantineTextEditor/MantineTextEditor'

interface ButtonGroupProps {
  children: ReactNode
  mode: TextEditorMode
}

export const ButtonGroup: FC<ButtonGroupProps> = ({ children, mode }) => {
  return (
    <div
      className={classNames(
        'flex gap-1 border-r border-border pr-3 pl-3 first-of-type:pl-0',
        mode === 'modal' && '!border-hover'
      )}
    >
      {children}
    </div>
  )
}
