import data from '@emoji-mart/data'
import { SearchIndex, init } from 'emoji-mart'
import React, { FC, useEffect, useState } from 'react'
import { ITaskComment, useComment } from '@/entities/TaskComment'
import { ITaskCommentReactDto } from '@/entities/TaskComment/model/types/task-comment.interface'
import { Magnify } from '@/shared/assets/images/icons'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Input } from '@/shared/ui/Input/Input'
import styles from './EmojiPickerWithSearch.module.scss'


init({ data })

interface EmojiSkin {
  native: string
}

export interface Emoji {
  name: string
  native: string
}

interface Category {
  name: string
  emojis: string[]
}

interface EmojiData {
  emojis: Record<string, Emoji>
  categories: Category[]
  name: string
  skins: EmojiSkin[]
}

interface Props {
  comment: ITaskComment
}

export const EmojiPickerWithSearch: FC<Props> = ({ comment }) => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [frequentlyUsedEmojis, setFrequentlyUsedEmojis] = useState<
    { native: string; name: string }[]
  >([])
  const [emojiResults, setEmojiResults] = useState<Emoji[]>([])
  const {
    taskCommentStore,
    taskStore: { activeTask },
    authStore: { user }
  } = useRootStore()
  const { addReactionAsync, deleteReactionAsync } = useComment(activeTask)

  useEffect(() => {
    const storedEmojis = LocalStorageHelper.getFrequentlyUsedEmojis()
    if (storedEmojis) {
      setFrequentlyUsedEmojis(storedEmojis)
    }
  }, [])

  const handleEmojiSelect = async (emoji: { native: string; name: string }) => {
    const { native, name } = emoji

    try {
      taskCommentStore.editTaskComment = comment

      const existingReaction = comment.reactions.find(
        (reaction) =>
          reaction.name.toLowerCase() === name.toLowerCase() &&
          reaction.user.id === user.id
      )

      if (existingReaction) {
        await deleteReactionAsync.mutateAsync({
          taskId: activeTask.id,
          comment: comment,
          reactionId: existingReaction.id
        })
      } else {
        const dto: ITaskCommentReactDto = { name }
        await addReactionAsync.mutateAsync({
          taskId: activeTask.id,
          comment: comment,
          dto: dto,
          user: user
        })
      }
    } catch (error) {
      console.error('Error updating reaction:', error)
    }

    const existingIndex = frequentlyUsedEmojis.findIndex(
      (e) => e.native === native
    )
    let newEmojis
    if (existingIndex !== -1) {
      const updatedEmojis = [...frequentlyUsedEmojis]
      updatedEmojis.splice(existingIndex, 1)
      newEmojis = [{ native, name }, ...updatedEmojis].slice(0, 8)
    } else {
      newEmojis = [{ native, name }, ...frequentlyUsedEmojis].slice(0, 8)
    }
    setFrequentlyUsedEmojis(newEmojis)
    LocalStorageHelper.setFrequentlyUsedEmojis(newEmojis)

    setSearchTerm('')
    setEmojiResults([])
  }

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    setSearchTerm(term)

    let results: { name: string; native: string }[] = []

    if (term) {
      const emojis = (await SearchIndex.search(term)) as EmojiData[]
      results = emojis.map((emoji) => ({
        name: emoji.name,
        native: emoji.skins[0].native
      }))
    }

    setEmojiResults(results)
  }

  return (
    <div className={styles.container}>
      {emojiResults.length || frequentlyUsedEmojis.length ? (
        <div className={styles.results}>
          {emojiResults.length > 0
            ? emojiResults.slice(0, 8).map((emoji, index) => (
                <p
                  key={index}
                  className={styles.emoji}
                  onClick={() =>
                    handleEmojiSelect({
                      native: emoji.native,
                      name: emoji.name
                    })
                  }
                >
                  <span>{emoji.native}</span>
                </p>
              ))
            : frequentlyUsedEmojis.map((emoji, index) => (
                <p
                  key={index}
                  className={styles.emoji}
                  onClick={() =>
                    handleEmojiSelect({
                      native: emoji.native,
                      name: emoji.name
                    })
                  }
                >
                  <span>{emoji.native}</span>
                </p>
              ))}
        </div>
      ) : undefined}
      <Input
        placeholder='Search for emojis'
        value={searchTerm}
        onChange={handleSearchChange}
        EndIcon={Magnify}
      />
    </div>
  )
}
