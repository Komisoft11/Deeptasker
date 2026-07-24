import { FC } from 'react'
import { TaskFilterContent } from '@/features/Task/TaskChip/ui/TaskChipDropdown/TaskFilterContent'
import { Popover } from '@/shared/ui/Popover/Popover'

export const TaskChip: FC = () => {
  // const [showDropdown, setShowDropdown] = useState(false)
  //
  // const { t } = useTranslation()
  // const clearFilter = () => {
  //   taskFilterStore.removeActiveFilterByProperty('FINISHED_TASK_FILTER')
  // }

  return (
    <Popover>
      <Popover.Trigger>TaskChip</Popover.Trigger>
      <Popover.Content>
        <TaskFilterContent />
      </Popover.Content>
    </Popover>
    // <Chip
    //   active={!!taskFilterStore.getActiveFilterByName('FINISHED_TASK_FILTER')}
    //   titleContent={t('task.title')}
    //   dropdown={<TaskFilterContent setShowDropdown={setShowDropdown} />}
    //   handleClickByCross={() => clearFilter()}
    //   setShowDropdown={setShowDropdown}
    //   showDropdown={showDropdown}
    //   classNameTrigger={'p-2 bg-[var(--hover]'}
    // />
  )
}
