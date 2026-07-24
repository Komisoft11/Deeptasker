import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { useCurrentView } from '@/shared/lib/hooks/useCurrentView'
import { Header } from '@/shared/ui/Header/Header'
import { EmptyItem } from '@/shared/ui/Loading/EmptyItem'

export const TaskHeaderLoader: FC = observer(() => {
  const { isKanbanView } = useCurrentView()

  return (
    <Header
      title={
        <div className={'flex gap-2 items-center justify-center'}>
          <EmptyItem className={'w-[136px] h-[28px]'} />
          <EmptyItem className={'w-[70px] h-[20px]'} />
        </div>
      }
      withProjectSidebarOpen
      withBreadcrumbs
      mainInfoClassName={isKanbanView ? '!w-[calc((100%-32px)/3)]' : undefined}
    />
  )
})
