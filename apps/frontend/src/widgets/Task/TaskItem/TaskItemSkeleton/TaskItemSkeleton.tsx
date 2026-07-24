import React from 'react'
import { Loading } from '@/shared/ui/Loading/Loading'

export const TaskItemSkeleton = () => {
  return (
    <div className={'flex justify-center items-center h-full'}>
      <Loading variant={'spinner'} className={'stroke-white'} />
    </div>
  )
}
