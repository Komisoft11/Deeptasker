import { DetailedHTMLProps, FC, HTMLAttributes, ReactNode } from 'react'

interface Props
  extends DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  sectionTitle: string
  children: ReactNode
}

export const LabelSidebar: FC<Props> = ({ children, sectionTitle, style }) => {
  return (
    <div
      style={style}
      className={
        'flex flex-col gap-2 p-4 pr-[6px] flex-wrap border-b border-hover'
      }
    >
      <h3>{sectionTitle}</h3>
      <div className={'flex flex-col gap-1'}>{children}</div>
    </div>
  )
}
