import { observer } from 'mobx-react-lite'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CommentEditor } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/ui/CommentEditor/CommentEditor'
import { CommentItem } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/ui/CommentItem/CommentItem'
import { usePermissionTask } from '@/entities/Task'
import { ITaskComment } from '@/entities/TaskComment'
import { useComment } from '@/entities/TaskComment/lib/hooks/useComment'
import { IUser } from '@/entities/User'
import { PlusCircle } from '@/shared/assets/images/icons'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { Loading } from '@/shared/ui/Loading/Loading'
import styles from './TaskCommentTab.module.scss'

export interface ReplyData {
  user: IUser
  dateCreated: Date
  content: string
  replyId: number
}

interface Props {
  isSortDes: boolean
}

export const TaskCommentTab = observer(({ isSortDes }: Props) => {
  const {
    taskStore: { activeTask },
    taskCommentStore
  } = useRootStore()
  const { t } = useTranslation([ENTITY, TRANSLATION])

  const { canCreateCommentsTask } = usePermissionTask(activeTask)

  const { comments, isLoading } = useComment(activeTask)

  const [isAddComment, setIsAddComment] = useState<boolean>(false)
  const [buttonHeight, setButtonHeight] = useState<number>(0)
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null)
  const [replyData, setReplyData] = useState<ReplyData | null>(null)

  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (buttonRef.current) {
      setButtonHeight(buttonRef.current.offsetHeight)
    }
  }, [isAddComment, replyData])

  if (isLoading)
    return (
      <div className={'w-full h-full flex justify-center items-center'}>
        <Loading variant={'spinner'} />
      </div>
    )

  const sortComments = (descending: boolean, comments?: ITaskComment[]) =>
    comments &&
    comments.sort((a, b) =>
      descending
        ? new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
        : new Date(a.dateCreated).getTime() - new Date(b.dateCreated).getTime()
    )

  const sortedComments = sortComments(isSortDes, comments)

  const renderCommentSection =
    isAddComment || replyData ? (
      <CommentEditor
        mode={replyData ? 'reply' : 'edit'}
        setIsAddComment={setIsAddComment}
        replyData={replyData}
        setReplyData={setReplyData}
        setActiveCommentId={setActiveCommentId}
      />
    ) : (
      <Button
        styleButton='filled'
        icon={<PlusCircle />}
        onClick={() => {
          setIsAddComment(true)
          taskCommentStore.isEditTaskComment = false
          taskCommentStore.editTaskComment = undefined
          setActiveCommentId(null)
        }}
        className='px-4 py-3 body-14-16'
      >
        {t('task.comments.addComment', { ns: ENTITY })}
      </Button>
    )

  return (
    <div
      className={'flex flex-col'}
      style={{ paddingBottom: `${buttonHeight}px` }}
    >
      {sortedComments && sortedComments.length ? (
        sortedComments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            setIsAddComment={setIsAddComment}
            setReplyData={setReplyData}
            activeCommentId={activeCommentId}
            setActiveCommentId={setActiveCommentId}
          />
        ))
      ) : (
        <p className={'secondaryText body-12 w-full text-center'}>
          {t('task.comments.commentsPlaceholder', { ns: ENTITY })}
        </p>
      )}

      {canCreateCommentsTask && (
        <div ref={buttonRef} className={styles.buttonContainer}>
          {renderCommentSection}
        </div>
      )}
    </div>
  )
})
