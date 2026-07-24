import { CSSProperties } from 'react'
import { IBreadcrumb } from '@/shared/ui/Breadcrumbs/type/breadcrumbs.interface'
import { Breadcrumb } from '@/shared/ui/Breadcrumbs/ui/Breadcrumb/Breadcrumb'
import { BreadcrumbDropdown } from '@/shared/ui/Breadcrumbs/ui/BreadcrumbDropdown/BreadcrumbDropdown'
import styles from './Breadcrumbs.module.scss'

interface StylesProps {
  container: CSSProperties
}

type ClassNamesConfig = {
  [K in keyof StylesProps]?: StylesProps[K]
}

interface Props {
  maxCount?: number
  breadcrumbs: IBreadcrumb[]
  classNames?: ClassNamesConfig
}

export const Breadcrumbs = ({
  breadcrumbs: _breadcrumbs,
  maxCount = 5
}: Props) => {
  if (!_breadcrumbs?.length) {
    return null
  }

  const isCollapsed = maxCount < _breadcrumbs.length
  const lastIndex = _breadcrumbs.length - 1

  if (isCollapsed) {
    const startBreadcrumbs = _breadcrumbs.slice(0, maxCount - 1)
    const dropdownBreadcrumbs = _breadcrumbs.slice(maxCount - 1, lastIndex)
    const lastBreadcrumb = _breadcrumbs[lastIndex]

    return (
      <div className={styles.container}>
        {startBreadcrumbs.map((breadcrumb) => (
          <Breadcrumb key={breadcrumb.id} breadcrumb={breadcrumb} />
        ))}
        <BreadcrumbDropdown breadcrumbs={dropdownBreadcrumbs} />
        <Breadcrumb
          key={lastBreadcrumb.id}
          breadcrumb={lastBreadcrumb}
          isLast
        />
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {_breadcrumbs.map((breadcrumb, index) => (
        <Breadcrumb
          key={breadcrumb.id}
          breadcrumb={breadcrumb}
          isLast={index === lastIndex}
        />
      ))}
    </div>
  )
}
