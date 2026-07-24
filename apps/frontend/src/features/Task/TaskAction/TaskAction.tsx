import classNames from 'classnames'
import { DetailedHTMLProps, FC, HTMLAttributes, ReactNode, useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import styles from './TaskAction.module.scss'

interface Props
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  children: ReactNode
  contentForToolkit: string
  isHoveredTask: boolean
}

export const TaskAction: FC<Props> = ({
  children,
  contentForToolkit,
  isHoveredTask,
  className,
  ...props
}) => {
  const nodeRef = useRef(null)

  return (
    <>
      <CSSTransition
        classNames={{
          enter: styles.transitionEnter,
          exit: styles.transitionExit,
          enterActive: styles.transitionEnterActive,
          exitActive: styles.transitionExitActive
        }}
        in={isHoveredTask}
        nodeRef={nodeRef}
        timeout={200}
        unmountOnExit
      >
        <div
          {...props}
          className={classNames(styles.actionTask, className)}
          ref={nodeRef}
        ></div>
      </CSSTransition>
    </>
  )
}
