import classNames from 'classnames'
import React, {
  ComponentPropsWithoutRef,
  FC,
  ReactNode,
  forwardRef
} from 'react'
import './Table.scss'

interface Props extends ComponentPropsWithoutRef<'div'> {
  children?: ReactNode
}

interface DotNotation {
  Head: typeof Head
  Body: typeof Body
  Row: typeof Row
  Cell: typeof Cell
  Resizer: typeof Resizer
}

const Table = forwardRef<HTMLDivElement, Props>(
  ({ className, children, ...props }, ref) => (
    <div className={classNames('DT_Table', className)} ref={ref} {...props}>
      {children}
    </div>
  )
) as unknown as React.FC<Props> & DotNotation

const Head = forwardRef<HTMLDivElement, Props>(
  ({ className, children, ...props }, ref) => (
    <div className={classNames('DT_TableHead', className)} ref={ref} {...props}>
      {children}
    </div>
  )
)

const Body = forwardRef<HTMLDivElement, Props>(
  ({ className, children, ...props }, ref) => (
    <div
      className={classNames(
        'DT_TableBody',
        'scrollbarContainerOnBg',
        className
      )}
      ref={ref}
      {...props}
    >
      {children}
    </div>
  )
)

const Row = forwardRef<HTMLDivElement, Props>(
  ({ className, children, ...props }, ref) => (
    <div className={classNames('DT_TableRow', className)} ref={ref} {...props}>
      {children}
    </div>
  )
)

const Cell: FC<Props> = ({ children, className, ...props }) => (
  <div className={classNames('DT_TableCell', className)} {...props}>
    {children}
  </div>
)

interface ResizerProps extends Props {
  isResize?: boolean
}

const Resizer: FC<ResizerProps> = ({
  children,
  className,
  isResize,
  ...props
}) => (
  <div
    className={classNames(
      'DT_TableResizer',
      isResize && 'DT_TableResizer-resize',
      className
    )}
    {...props}
  >
    {children}
  </div>
)

Table.Head = Head
Table.Body = Body
Table.Row = Row
Table.Cell = Cell
Table.Resizer = Resizer

export { Table }
