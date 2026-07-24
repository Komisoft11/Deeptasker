import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { ComponentType, FC, useState } from 'react'
import { Files } from '@/widgets/Task/TaskItem/Files/Files'
import { ReplyData } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/TaskCommentTab'
import { formatDateTime } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/helper/formatDateTime'
import { CommentEditor } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/ui/CommentEditor/CommentEditor'
import { ReplyContainer } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/ui/CommentItem/ui/ReplyContainer'
import { EmojiPickerWithSearch } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/ui/EmojiPickerWithSearch/EmojiPickerWithSearch'
import { EmojisArray } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/ui/EmojisArray/EmojisArray'
import { UserAvatar } from '@/features/User'
import { usePermissionTask } from '@/entities/Task'
import { ITaskComment, useComment } from '@/entities/TaskComment'
import { Edit, Emoji, Reply, Trash } from '@/shared/assets/images/icons'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Popover } from '@/shared/ui/Popover/Popover'
import styles from './CommentItem.module.scss'

interface Props {
  comment: ITaskComment
  setIsAddComment: (isAddComment: boolean) => void
  setReplyData: (replyData: ReplyData | null) => void
  setActiveCommentId: (activeCommentId: number | null) => void
  activeCommentId: number | null
}

export const CommentItem: FC<Props> = observer(
  ({
    comment,
    setActiveCommentId,
    activeCommentId,
    setReplyData,
    setIsAddComment
  }) => {
    const {
      user: commentUser,
      dateCreated,
      content,
      files,
      reactions
    } = comment
    const {
      taskCommentStore,
      taskStore: { activeTask },
      authStore: { user }
    } = useRootStore()

    const {
      canEditTaskComments,
      canDeleteTaskComments,
      canReactTaskComment,
      canCreateCommentsTask
    } = usePermissionTask(activeTask)

    const canEdit = canEditTaskComments(commentUser.id === user.id)
    const canDelete = canDeleteTaskComments(commentUser.id === user.id)

    const { comments, deleteCommentAsync } = useComment(activeTask)

    const [openPopoverId, setOpenPopoverId] = useState<number | null>(null)

    const handleEdit = (comment: ITaskComment) => {
      if (
        taskCommentStore.isEditTaskComment &&
        taskCommentStore.editTaskComment?.id === comment.id
      ) {
        taskCommentStore.isEditTaskComment = false
        taskCommentStore.editTaskComment = undefined
        setActiveCommentId(null)
      } else {
        taskCommentStore.isEditTaskComment = true
        taskCommentStore.editTaskComment = comment
        setReplyData(null)
        setIsAddComment(false)
        setActiveCommentId(comment.id)
      }
    }

    const handleDeleteComment = (taskComment: ITaskComment) => {
      return deleteCommentAsync.mutateAsync({
        taskComment: taskComment,
        task: activeTask
      })
    }

    const handleOpenEmojis = (commentId: number | null) => {
      setActiveCommentId(commentId)
      setOpenPopoverId((prevOpenId: number | null) =>
        prevOpenId === commentId ? null : commentId
      )
    }

    const handleReply = (comment: ITaskComment) => {
      if (
        activeCommentId === comment.id &&
        !taskCommentStore.isEditTaskComment
      ) {
        setActiveCommentId(null)
        setReplyData(null)
      } else {
        taskCommentStore.isEditTaskComment = false
        taskCommentStore.editTaskComment = undefined
        setActiveCommentId(comment.id)
        setReplyData({
          user: commentUser,
          dateCreated: comment.dateCreated,
          content: comment.content,
          replyId: comment.id
        })
      }
    }

    const findCommentById = (id: number) => {
      return comments?.find((c) => c.id === id) || null
    }

    return (
      <div
        key={comment.id}
        id={`comment-${comment.id}`}
        className={classNames(
          styles.commentContainer,
          activeCommentId === comment.id && styles.active
        )}
      >
        <div>
          <UserAvatar user={comment.user} />
        </div>

        <div className={styles.content}>
          <div className={'flex justify-between gap-3'}>
            <div className={styles.userInfo}>
              <p className={'body-14-16'}>
                {commentUser.firstName} {commentUser.lastName}
              </p>
              <p className={'secondaryText body-12'}>
                {formatDateTime({ date: dateCreated })}
              </p>
            </div>
            <div className={styles.actions}>
              {canCreateCommentsTask && (
                <ActionIcon Icon={Reply} onClick={() => handleReply(comment)} />
              )}
              {canReactTaskComment && (
                <Popover
                  open={openPopoverId === comment.id}
                  onOpenChange={() =>
                    handleOpenEmojis(
                      activeCommentId === comment.id ? null : comment.id
                    )
                  }
                >
                  <Popover.Trigger className={'p-0'}>
                    <ActionIcon Icon={Emoji} />
                  </Popover.Trigger>
                  <Popover.Content side='bottom' align='end' className={'p-0'}>
                    <EmojiPickerWithSearch comment={comment} />
                  </Popover.Content>
                </Popover>
              )}
              <>
                {canEdit && (
                  <ActionIcon Icon={Edit} onClick={() => handleEdit(comment)} />
                )}
                {canDelete && (
                  <ActionIcon
                    Icon={Trash}
                    className='iconRed'
                    onClick={() => handleDeleteComment(comment)}
                  />
                )}
              </>
            </div>
          </div>
          {comment.replyId && (
            <ReplyContainer
              replyId={comment.replyId}
              reply={findCommentById(comment.replyId) as ReplyData}
              user={user}
            />
          )}
          {taskCommentStore.isEditTaskComment &&
          taskCommentStore.editTaskComment?.id === comment.id ? (
            <CommentEditor
              mode='reply'
              taskComment={comment}
              onSave={() => setActiveCommentId(null)}
            />
          ) : (
            <div
              className={classNames(
                styles.commentContent,
                'whitespace-pre-wrap'
              )}
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
          {comment.files.length > 0 && (
            <Files files={files} isSmall comment={comment} />
          )}
          {reactions && <EmojisArray comment={comment} />}
        </div>
      </div>
    )
  }
)

const ActionIcon: FC<{
  Icon: ComponentType<{ className?: string }>
  className?: string
  onClick?: () => void
}> = ({ Icon, className = '', onClick }) => (
  <div className={`iconContainer ${className}`} onClick={onClick}>
    <Icon className={'icon'} />
  </div>
)