import { FC } from 'react'
import { Task } from '@/entities/Task'
import { ExtraInfoLayout } from '@/entities/Task/ui/ExtraInfoLayout/ExtraInfoLayout'
import { Paperclip } from '@/shared/assets/images/icons/textEditorIcons'

interface Props {
  task: Task
  isKanban?: boolean
}

export const Files: FC<Props> = ({ task, isKanban }) => {
  return (
    <ExtraInfoLayout isKanban={isKanban}>
      <Paperclip />
      <p>{task.files.length}</p>
    </ExtraInfoLayout>
  )
}
