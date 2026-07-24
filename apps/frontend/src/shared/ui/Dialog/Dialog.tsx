import * as DialogPrimitive from '@radix-ui/react-dialog'
import {
  DialogContentProps,
  DialogProps as DialogPropsPrimitive,
  DialogTitleProps,
  DialogTriggerProps,
  Root,
  Title,
  Trigger
} from '@radix-ui/react-dialog'
import classNames from 'classnames'
import { FC, ReactNode } from 'react'
import { CloseButton } from '@/shared/ui/Button/CloseButton/CloseButton'
import './Dialog.scss'

interface DotNotation {
  Trigger: typeof DialogTrigger
  Content: typeof DialogContent
  Title: typeof DialogTitle
}

export interface DialogProps extends DialogPropsPrimitive {}

const Dialog: FC<DialogProps> & DotNotation = (props) => {
  return <Root {...props} />
}

const DialogTrigger: FC<DialogTriggerProps> = (props) => {
  return <Trigger {...props} />
}

const DialogTitle: FC<DialogTitleProps> = (props) => {
  return <Title className={'DT_Dialog_Title'} {...props} />
}

const DialogContent: FC<
  Omit<DialogContentProps, 'title'> & { title?: ReactNode | string }
> = ({ children, className, title, ...props }) => {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className='DT_Dialog_Overlay' />
      <DialogPrimitive.Content
        className={classNames('DT_Dialog_Content', className)}
        aria-describedby={undefined}
        {...props}
      >
        <DialogPrimitive.Title className={'DT_Dialog_Title'}>
          {title}
          <DialogPrimitive.Close asChild>
            <CloseButton />
          </DialogPrimitive.Close>
        </DialogPrimitive.Title>

        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

Dialog.Trigger = DialogTrigger
Dialog.Content = DialogContent
Dialog.Title = DialogTitle

export { Dialog }
