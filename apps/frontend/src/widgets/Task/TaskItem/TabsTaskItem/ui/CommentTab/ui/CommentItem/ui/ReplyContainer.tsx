import React, { FC } from 'react'
import styled from 'styled-components'
import { ReplyData } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/TaskCommentTab'
import { formatDateTime } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/helper/formatDateTime'
import { handleScrollToComment } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/helper/handleScrollToComment'
import styles from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/ui/CommentItem/CommentItem.module.scss'
import { IUser } from '@/entities/User'


export const ReplyContainer: FC<{
  replyId: number
  reply: ReplyData | null
  user: IUser
}> = ({ reply, user, replyId }) => {
  if (!reply) {
    return (
      <div className={styles.replyContainer}>
        <p className='body-12 secondaryText'>This comment has been deleted.</p>
      </div>
    )
  }

  return (
    <StyledReplyContainer onClick={() => handleScrollToComment(replyId)}>
      <div className={'flex gap-1 items-center'}>
        <p className='body-14-16'>
          {reply.user.id === user.id
            ? 'Ваш комментарий'
            : `${reply.user.firstName} ${reply.user.lastName}`}
        </p>
        <p className='body-12 secondaryText'>
          {formatDateTime({ date: reply.dateCreated })}
        </p>
      </div>
      <div
        className={'body-12 secondaryText'}
        dangerouslySetInnerHTML={{ __html: reply.content }}
      />
    </StyledReplyContainer>
  )
}

const StyledReplyContainer = styled.div`
  padding: 12px 14px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: var(--objects);
  width: 100%;
`
