import classNames from 'classnames'
import { Link } from 'react-router'
import { CaretRight } from '@/shared/assets/images/icons'
import { IBreadcrumb } from '@/shared/ui/Breadcrumbs/type/breadcrumbs.interface'
import styles from './Breadcrumb.module.scss'

interface Props {
  breadcrumb: IBreadcrumb
  isLast?: boolean
}

export const Breadcrumb = ({ breadcrumb, isLast = false }: Props) => {
  return breadcrumb.url ? (
    <Link
      to={breadcrumb.url}
      className={classNames(styles.breadcrumb, isLast && styles.lastBreadcrumb)}
    >
      {breadcrumb.icon && breadcrumb.icon}
      <div className={'flex gap-1 items-center'}>
        <div
          className={classNames(
            'body-14-16 p-2 rounded-lg',
            isLast
              ? 'bg-hover'
              : 'hover:bg-hover hover:cursor-pointer hover:text-textMain'
          )}
        >
          <p className={'ellipsis max-w-[200px]'}>{breadcrumb.title}</p>
        </div>
        {!isLast && <CaretRight className={'w-4 h-4'} />}
      </div>
    </Link>
  ) : (
    <div
      className={classNames(styles.breadcrumb, isLast && styles.lastBreadcrumb)}
      onClick={() => breadcrumb.onClick && breadcrumb.onClick()}
    >
      <div className={'flex gap-1 items-center'}>
        <div
          className={classNames(
            'body-14-16 p-2 rounded-lg items-center flex gap-1',
            isLast
              ? 'bg-hover'
              : 'hover:bg-hover hover:cursor-pointer hover:text-textMain'
          )}
        >
          {breadcrumb.icon && breadcrumb.icon}
          <p className={'ellipsis max-w-[200px]'}>{breadcrumb.title}</p>
        </div>
        {!isLast && <CaretRight className={'w-4 h-4'} />}
      </div>
    </div>
  )
}
