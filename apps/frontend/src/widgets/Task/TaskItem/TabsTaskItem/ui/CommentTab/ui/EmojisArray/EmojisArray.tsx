import data from '@emoji-mart/data'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC, useEffect, useRef, useState } from 'react'
import { formatDateTime } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/helper/formatDateTime'
import { UserAvatar } from '@/features/User'
import { ITaskComment, useComment } from '@/entities/TaskComment'
import { IUser } from '@/entities/User'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Popover } from '@/shared/ui/Popover/Popover'
import styles from './EmojisArray.module.scss'


interface EmojiSkin {
  native: string
}

interface Emoji {
  name: string
  native: string
  skins: EmojiSkin[]
}

interface Category {
  name: string
  emojis: string[]
}

interface EmojiData {
  emojis: Record<string, Emoji>
  categories: Category[]
}

interface Props {
  comment: ITaskComment
}

export const EmojisArray: FC<Props> = observer(({ comment }) => {
  const {
    taskStore: { activeTask },
    authStore: { user: currentUser }
  } = useRootStore()
  const { addReactionAsync, deleteReactionAsync } = useComment(activeTask)

  const [openReaction, setOpenReaction] = useState<string | null>(null)
  const [selectedReactionUsers, setSelectedReactionUsers] = useState<
    { user: IUser; dateCreated: Date }[]
  >([])

  const popoverRef = useRef<HTMLUListElement | null>(null)

  const renderReactionEmoji = (reactionName: string) => {
    const emojiData = data as EmojiData
    const emoji = Object.values(emojiData.emojis).find(
      (emoji) => emoji.name.toLowerCase() === reactionName.toLowerCase()
    )

    return emoji ? emoji.skins[0].native : reactionName
  }

  const countReactions = (reactions: any[]) => {
    const reactionCounts: Record<
      string,
      {
        count: number
        reactionId: number
        userIds: number[]
        users: { user: IUser; dateCreated: Date }[]
      }
    > = {}

    reactions.forEach((reaction) => {
      const { name, user, id, dateCreated } = reaction
      const userId = user?.id

      if (reactionCounts[name]) {
        reactionCounts[name].count += 1
        reactionCounts[name].userIds.push(userId)
        reactionCounts[name].users.push({ user, dateCreated })
        reactionCounts[name].reactionId = id
      } else {
        reactionCounts[name] = {
          count: 1,
          userIds: [userId],
          users: [{ user, dateCreated }],
          reactionId: id
        }
      }
    })
    return reactionCounts
  }

  const handleReactionClick = async (reactionName: string) => {
    const dto = { name: reactionName }

    try {
      const reaction = comment.reactions.find(
        (r) => r.user.id === currentUser.id && r.name === reactionName
      )

      if (reaction) {
        await deleteReactionAsync.mutateAsync({
          taskId: activeTask.id,
          comment: comment,
          reactionId: reaction.id
        })
      } else {
        await addReactionAsync.mutateAsync({
          taskId: activeTask.id,
          comment: comment,
          dto: dto,
          user: currentUser
        })
      }
    } catch (error) {
      console.error('Error handling reaction:', error)
    }
  }

  const handleRightClick = (event: React.MouseEvent, reactionName: string) => {
    event.preventDefault()
    const reactionCounts = countReactions(comment.reactions)
    const users = reactionCounts[reactionName]?.users || []
    setSelectedReactionUsers(users)
    setOpenReaction((prev) => (prev === reactionName ? null : reactionName))
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setOpenReaction(null)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const reactionCounts = countReactions(comment.reactions)

  return (
    <div className={'flex gap-1'}>
      {Object.entries(reactionCounts).map(
        ([reactionName, { count, userIds }]) => (
          <Popover key={reactionName} open={openReaction === reactionName}>
            <Popover.Trigger
              onContextMenu={(event) => handleRightClick(event, reactionName)}
              onClick={() => handleReactionClick(reactionName)}
              className={classNames(
                styles.trigger,
                userIds.includes(currentUser.id) ? 'bg-accent' : 'bg-objects'
              )}
            >
              <p className={styles.emoji}>
                {renderReactionEmoji(reactionName)}
              </p>
              <p
                className={classNames(
                  'body-14-20',
                  userIds.includes(currentUser.id)
                    ? 'text-activeText'
                    : 'text-textMain'
                )}
              >
                {count}
              </p>
            </Popover.Trigger>
            <Popover.Content className={'w-[300px]'} asChild>
              <ul className={'flex flex-col gap-2'} ref={popoverRef}>
                {selectedReactionUsers.map(({ user, dateCreated }, index) => (
                  <li key={index} className={'flex gap-3 items-center py-2'}>
                    <UserAvatar user={user} />
                    <div className={'flex flex-col gap-1'}>
                      <p className={'body-14-16'}>
                        {user.firstName} {user.lastName}
                      </p>
                      <p className={'secondaryText body-12'}>
                        {formatDateTime({ date: dateCreated })}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </Popover.Content>
          </Popover>
        )
      )}
    </div>
  )
})
