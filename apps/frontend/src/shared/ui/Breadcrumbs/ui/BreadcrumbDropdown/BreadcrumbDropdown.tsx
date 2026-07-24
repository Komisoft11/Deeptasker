import { Link } from 'react-router'
import { CaretRight } from '@/shared/assets/images/icons'
import { IBreadcrumb } from '@/shared/ui/Breadcrumbs/type/breadcrumbs.interface'
import { DropdownMenu } from '@/shared/ui/DropdownMenu/DropdownMenu'

interface Props {
  breadcrumbs: IBreadcrumb[]
}

export const BreadcrumbDropdown = ({ breadcrumbs }: Props) => {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger
        style={{ padding: 0, userSelect: 'none' }}
        className={'secondaryText flex gap-1'}
      >
        <p className={'p-2 rounded-lg hover:text-textMain hover:bg-hover'}>
          ...
        </p>
        <CaretRight className={'icon w-4 h-4 '} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className={'p-2 flex flex-col gap-2 max-h-[300px] overflow-y-auto'}
      >
        {breadcrumbs.map((breadcrumb) => (
          <DropdownMenu.Item
            asChild
            key={'dropdown:' + breadcrumb.id}
            className={'p-2 rounded-lg h-max w-[250px] hover:bg-hover'}
          >
            {breadcrumb.url ? (
              <Link
                to={breadcrumb.url}
                className={'body-14-16 ellipsis h-full'}
              >
                {breadcrumb.title}
              </Link>
            ) : (
              <p className={'body-14-16 ellipsis h-full'}>{breadcrumb.title}</p>
            )}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
