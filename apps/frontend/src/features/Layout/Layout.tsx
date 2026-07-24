import { CSSProperties, FC, ReactNode, forwardRef } from 'react'
import './Layout.scss'

interface Props {
  children: ReactNode
}

interface BodyProps extends Props {
  style?: CSSProperties
  className?: string
}

interface SidebarProps extends Props {}

interface DonNotation {
  LeftSidebar: typeof Sidebar
  RightSidebar: typeof Sidebar
  Body: typeof Body
}

const Layout: FC<Props> & DonNotation = ({ children }) => {
  return <div className={'DT_Layout'}>{children}</div>
}

const Body: FC<BodyProps> = ({ children, style, className }) => {
  return (
    <div className={`h-full w-full ${className || ''}`} style={style}>
      {children}
    </div>
  )
}

const Sidebar = forwardRef<HTMLDivElement, SidebarProps>(
  ({ children }, ref) => {
    return <div ref={ref}>{children}</div>
  }
)

Layout.Body = Body
Layout.LeftSidebar = Sidebar
Layout.RightSidebar = Sidebar

export { Layout }
