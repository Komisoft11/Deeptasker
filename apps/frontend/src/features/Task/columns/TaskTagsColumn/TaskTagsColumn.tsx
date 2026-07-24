import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import { useRef, useState } from 'react'
import { TaskProjectTag } from '@/widgets/Task'
import { Task, usePermissionTask } from '@/entities/Task'
import useEnhancedEffect from '@/shared/lib/hooks/useEnhancedEffect'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import styles from './TaskTagsColumn.module.scss'


interface Props {
  task: Task
}

export const TaskTagsColumn = observer(({ task }: Props) => {
  const {
    sidebarStore: {
      isExtendedFirstLeftOpen,
      isFirstLeftOpen,
      isSecondLeftOpen,
      isRightOpen
    }
  } = useRootStore()

  const ref = useRef<HTMLUListElement | null>(null)
  const [hiddenTagsLength, setHiddenTagsLength] = useState<number>(0)

  const { canEditTags } = usePermissionTask(task)

  const countHiddenTags = () => {
    if (!ref.current) {
      return
    }

    const offsetTopOfList = ref.current.offsetTop

    const lis = ref.current.querySelectorAll('li')
    const filteredLis = Array.from(lis).filter(
      (li) => li.offsetTop !== offsetTopOfList
    )

    setHiddenTagsLength(filteredLis.length)
  }

  const isDisabled = !canEditTags || task.dateFinished !== null

  useEnhancedEffect(() => {
    countHiddenTags()
    window.addEventListener('resize', countHiddenTags)
    return () => window.removeEventListener('resize', countHiddenTags)
  }, [isExtendedFirstLeftOpen, isFirstLeftOpen, isSecondLeftOpen, isRightOpen])

  if (!task.tags.length) {
    return (
      <TaskProjectTag
        key={task.tags.length}
        task={task}
        disabled={isDisabled}
      />
    )
  }

  return (
    <div className={styles.wrapper}>
      <ul className={styles.list} ref={ref}>
        {task.tags.map((tag) => (
          <li
            key={'column tag:' + tag.id}
            style={{ backgroundColor: tag.colorBg }}
            className={classNames(styles.tag, 'body-14-16')}
          >
            {tag.name}
          </li>
        ))}
      </ul>

      {!!hiddenTagsLength && <TagCounter tagLength={hiddenTagsLength} />}
    </div>
  )
})

const TagCounter = ({ tagLength }: { tagLength: number }) => {
  return (
    <div
      data-no-dnd={true}
      className={classNames(styles.counter, 'body-14-16')}
    >
      {tagLength > 9 ? '9+' : tagLength}
    </div>
  )
}
