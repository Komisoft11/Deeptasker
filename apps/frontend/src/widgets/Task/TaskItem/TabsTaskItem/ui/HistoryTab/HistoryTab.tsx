import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { formatDateTime } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/helper/formatDateTime'
import { taskActions } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/HistoryTab/consts/taskActions'
import { UserAvatar } from '@/features/User'
import { IUser } from '@/entities/User'
import { Arrow } from '@/shared/assets/images/icons'
import styles from './HistoryTab.module.scss'


export const HistoryTab = observer(() => {
  return (
    <ul className={styles.list}>
      {taskActions.map((action, index) => {
        const { user, date, assignee, status, comment, deadline, tags } = action
        return (
          <li key={index} className={styles.item}>
            <UserAvatar user={user as IUser} />
            <div className={styles.content}>
              <div className={styles.userInfo}>
                <p className={'body-14-16'}>
                  {user.firstName} {user.lastName} изменил(а) задачу
                </p>
                <p className={'secondaryText body-14-16'}>
                  {formatDateTime({ date: date })}
                </p>
              </div>

              {assignee && (
                <OldNewDisplay
                  label='Ответственный'
                  oldValue={`${assignee.old?.firstName} ${assignee.old?.lastName}`}
                  newValue={`${assignee.new.firstName} ${assignee.new.lastName}`}
                />
              )}

              {status && (
                <OldNewDisplay
                  label='Статус'
                  oldValue={status.old}
                  newValue={status.new}
                />
              )}

              {comment && <CommentDisplay comment={comment} />}

              {deadline && (
                <OldNewDisplay
                  label='Дедлайн'
                  oldValue={deadline.old}
                  newValue={deadline.new}
                />
              )}

              {tags && <TagsDisplay tags={tags} />}
            </div>
          </li>
        )
      })}
    </ul>
  )
})

interface OldNewDisplayProps {
  label: string
  oldValue?: string | null
  newValue: string
}

interface ValueProps {
  value: string
}

interface TagsDisplayProps {
  tags: {
    old: string[]
    new: string[]
  }
}

interface CommentDisplayProps {
  comment: string
}

const OldValue: FC<ValueProps> = ({ value }) => (
  <p className={'body-14-16 py-1 px-3 rounded-lg bg-objects line-through'}>
    {value}
  </p>
)

const NewValue: FC<ValueProps> = ({ value }) => (
  <p className={'body-14-16 py-1 px-3 rounded-lg bg-accent'}>{value}</p>
)

const OldNewDisplay: FC<OldNewDisplayProps> = ({
  label,
  oldValue,
  newValue
}) => (
  <div className={'flex gap-3 items-center'}>
    <p className={'body-14-16 w-[112px]'}>{label}:</p>
    {oldValue && <OldValue value={oldValue} />}
    {oldValue && <Arrow className='icon' />}
    <NewValue value={newValue} />
  </div>
)

const CommentDisplay: FC<CommentDisplayProps> = ({ comment }) => (
  <div className='flex gap-3 items-center'>
    <p className='body-14-16 w-[112px]'>Комментарий:</p>
    <p className='body-14-16 py-1 px-3 rounded-lg bg-objects'>{comment}</p>
  </div>
)

const TagsDisplay: FC<TagsDisplayProps> = ({ tags }) => (
  <div className='flex gap-3 items-center'>
    <p className='body-14-16 w-[112px]'>Теги:</p>
    <div className='flex gap-2 items-center'>
      {tags.old?.length > 0 &&
        tags.old.map((tag) => <OldValue key={tag} value={tag} />)}
      {tags.old?.length > 0 && <Arrow className='icon' />}
      {tags.new.map((tag) => (
        <NewValue key={tag} value={tag} />
      ))}
    </div>
  </div>
)
