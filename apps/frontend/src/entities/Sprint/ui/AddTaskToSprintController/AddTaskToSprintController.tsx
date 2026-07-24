import classNames from 'classnames'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { TaskNew } from '@/widgets/Task'
import { Sprint } from '@/entities/Sprint/model/sprint'
import { AddMultipleTasksToSprint } from '@/entities/Sprint/ui'
import { Plus } from '@/shared/assets/images/icons'
import { ENTITY } from '@/shared/const/translation'
import { Dialog } from '@/shared/ui/Dialog/Dialog'
import { Popover } from '@/shared/ui/Popover/Popover'


interface Props {
  sprint: Sprint
}

export type SprintModalProps = 'newTask' | 'existingTask' | null

export const AddTaskToSprintController: FC<Props> = ({ sprint }) => {
  const [openDialog, setOpenDialog] = useState<SprintModalProps>(null)
  const { t } = useTranslation(ENTITY)

  return (
    <div
      className={'py-4 border-t border-border flex items-center justify-center'}
    >
      <Popover>
        <Popover.Trigger
          className={'bg-accent px-4 py-3 flex gap-1 hover:opacity-80'}
          data-ignore-click='true'
        >
          <Plus className={'iconActive'} />
          <p className={'body-14-16 text-activeText'}>
            {t('task.info.addTask')}
          </p>
        </Popover.Trigger>
        <Popover.Content
          align={'center'}
          side={'top'}
          data-ignore-click='true'
          className={'w-[240px] p-1 flex flex-col gap-1'}
          sideOffset={8}
        >
          <PopoverOption
            label={t('sprints.createNew')}
            onClick={() => setOpenDialog('newTask')}
          />
          <PopoverOption
            label={t('sprints.addExisting')}
            onClick={() => setOpenDialog('existingTask')}
          />
        </Popover.Content>
      </Popover>
      <Dialog
        open={openDialog === 'newTask'}
        onOpenChange={() => setOpenDialog(null)}
      >
        <Dialog.Content
          title={t('task.newTaskCreation')}
          className={classNames(
            'radix-dialog-task-creation',
            'w-full max-w-[75vw] !z-[auto]'
          )}
        >
          <TaskNew
            onOpenChange={() => setOpenDialog(null)}
            sprintId={sprint.id}
          />
        </Dialog.Content>
      </Dialog>
      <Dialog
        open={openDialog === 'existingTask'}
        onOpenChange={() => setOpenDialog(null)}
      >
        <Dialog.Content
          title={t('task.addingTaskToSprint')}
          className={classNames(
            'radix-dialog-task-creation',
            'w-full max-w-[1200px]'
          )}
        >
          <AddMultipleTasksToSprint
            sprint={sprint}
            setOpenDialog={setOpenDialog}
          />
        </Dialog.Content>
      </Dialog>
    </div>
  )
}

interface PopoverOptionProps {
  label: string
  onClick?: () => void
}

const PopoverOption: FC<PopoverOptionProps> = ({ label, onClick }) => (
  <div
    className={
      'p-3 flex justify-center rounded-lg hover:bg-hover cursor-pointer'
    }
    onClick={onClick}
  >
    <p className={'body-14-16'}>{label}</p>
  </div>
)
