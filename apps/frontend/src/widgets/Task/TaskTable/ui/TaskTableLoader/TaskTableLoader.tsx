import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'
import { FolderListLoader } from '@/widgets/Folder'
import { SECOND_CREATION_STEP } from '@/entities/Guidance'
import { AddTaskInput } from '@/entities/Task'
import { ENTITY } from '@/shared/const/translation'
import { EmptyItem } from '@/shared/ui/Loading/EmptyItem'

export const TaskTableLoader: FC = () => {
  const { t } = useTranslation()

  const emptyList = new Array<null>(20).fill(null)

  return (
    <>
      <FolderListLoader />
      <div className='w-full h-full overflow-hidden flex flex-col gap-3'>
        <AddTaskInput
          id={SECOND_CREATION_STEP}
          label={t('task.quickAddTask', { ns: ENTITY }) as string}
          className={'w-full max-w-[640px] ml-[1px]'}
          disabled={true}
        />
        <ul>
          <EmptyItem className={'w-full h-[36px] mb-2'} />
          {emptyList.map((_, index) => (
            <EmptyItem key={index} className={'w-full h-[48px]'} />
          ))}
        </ul>
      </div>
    </>
  )
}
