import { FC, ReactNode } from 'react'
import { IPermissionProject } from '@/entities/Project'
import { Accordion } from '@/shared/ui/Accordion/Accordion'

interface CategoriesAccordionProps {
  categories: Record<string, (keyof IPermissionProject)[]>
  defaultOpen?: string[]
  title?: string
  className?: string
  renderCategory: (
    title: string,
    keys: (keyof IPermissionProject)[],
    itemClassName?: string,
    triggerClassName?: string
  ) => ReactNode
  itemClassName?: string
  triggerClassName?: string
}

export const CategoriesAccordion: FC<CategoriesAccordionProps> = ({
  categories,
  defaultOpen,
  title,
  className,
  renderCategory,
  itemClassName,
  triggerClassName
}) => {
  return (
    <Accordion
      type='multiple'
      defaultValue={defaultOpen ?? Object.keys(categories)}
      className={className}
    >
      {title && <h3 className='pb-3 border-b border-hover'>{title}</h3>}
      {Object.entries(categories).map(([title, keys]) =>
        renderCategory(
          title,
          keys as (keyof IPermissionProject)[],
          itemClassName,
          triggerClassName
        )
      )}
    </Accordion>
  )
}