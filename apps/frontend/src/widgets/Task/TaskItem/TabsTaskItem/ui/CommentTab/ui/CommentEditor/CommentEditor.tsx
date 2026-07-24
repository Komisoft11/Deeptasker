import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MantineTextEditor } from '@/widgets/MantineTextEditor/MantineTextEditor'
import { Files } from '@/widgets/Task/TaskItem/Files/Files'
import { ReplyData } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/TaskCommentTab'
import { ITaskComment, useComment } from '@/entities/TaskComment'
import {
  CreateCommentParams,
  FileData
} from '@/entities/TaskComment/model/types/task-comment.interface'
import { MAX_FILE_SIZE } from '@/shared/const/file'
import { ERRORS } from '@/shared/const/translation'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { isEmpty } from '@/shared/lib/helpers/main.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'


export type ModeEditorType = 'view' | 'edit' | 'reply'

interface Props {
  taskComment?: ITaskComment
  mode: ModeEditorType
  setIsAddComment?: (isAddComment: boolean) => void
  onSave?: (comment: string) => void
  replyData?: ReplyData | null
  setReplyData?: (replyData: ReplyData | null) => void
  setActiveCommentId?: (activeCommentId: number | null) => void
}

export const CommentEditor: FC<Props> = ({
  taskComment,
  setIsAddComment,
  mode,
  replyData,
  setReplyData,
  setActiveCommentId,
  onSave
}) => {
  const {
    taskCommentStore,
    taskStore: { activeTask }
  } = useRootStore()
  const { uploadFileAsync, createAsync, updateAsync } = useComment(activeTask)
  const [comment, setComment] = useState<ITaskComment | null>(
    taskComment || null
  )
  const [selectedFiles, setSelectedFiles] = useState<FileData[]>([])
  const { t } = useTranslation([ERRORS])

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const validFiles: FileData[] = []
    const rejectedFiles: File[] = []

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        rejectedFiles.push(file)
        return
      }

      validFiles.push({
        originalName: file.name,
        file,
        size: file.size,
        dateCreated: new Date()
      })
    })

    if (rejectedFiles.length > 0) {
      showToast({
        title: t('fileMaxSize', { ns: ERRORS }),
        type: 'error'
      })
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles])
    }
  }

  async function handleCreateComment() {
    const commentHTML = comment?.content || ''
    if (isEmpty(commentHTML)) return

    const commentParams: CreateCommentParams = {
      comment: commentHTML,
      task: activeTask,
      files: selectedFiles,
      replyId: mode === 'reply' ? replyData?.replyId : undefined
    }

    try {
      const createdComment = await createAsync.mutateAsync(commentParams)

      if (createdComment) {
        activeTask.comments.push({
          id: createdComment.id,
          content: commentHTML,
          user: LocalStorageHelper.getUser(),
          dateCreated: new Date(),
          dateUpdated: null,
          dateDeleted: null,
          reactions: [],
          files: selectedFiles,
          replyId: mode === 'reply' && replyData ? replyData.replyId : null
        })
      }
      resetEditorState()
    } catch (error) {
      console.error('Error creating comment:', error)
    }
  }

  async function handleEditComment() {
    if (!taskComment) return
    const commentHTML = comment?.content || ''
    try {
      await updateAsync.mutateAsync({
        task: activeTask,
        comment: commentHTML
      })
      await handleFileUploads(taskComment.id)

      const commentIndex = activeTask.comments.findIndex(
        (c) => c.id === taskComment.id
      )
      if (commentIndex > -1) {
        activeTask.comments[commentIndex] = {
          ...activeTask.comments[commentIndex],
          content: commentHTML,
          dateUpdated: new Date(),
          files: [
            ...(activeTask.comments[commentIndex].files || []),
            ...selectedFiles
          ]
        }
      }

      resetEditorState()
    } catch (error) {
      console.error('Error updating comment:', error)
    }
  }

  async function handleFileUploads(commentId: number) {
    if (selectedFiles.length > 0 && commentId) {
      try {
        await Promise.all(
          selectedFiles.map(async (fileData) => {
            if (!fileData.id) {
              const formData = new FormData()
              formData.append('file', fileData.file)

              const { id: fileId } = await uploadFileAsync.mutateAsync({
                commentId: commentId,
                formData: formData
              })

              fileData.id = fileId
            }
          })
        )
      } catch (error) {
        console.error('Error uploading files:', error)
      }
    }
  }

  function resetEditorState() {
    if (onSave) onSave(comment?.content || '')

    taskCommentStore.editTaskComment = undefined
    taskCommentStore.isEditTaskComment = false
    if (setIsAddComment) {
      setIsAddComment(false)
    }
    if (setReplyData) {
      setReplyData(null)
    }
    setComment(null)
    setSelectedFiles([])
    if (setActiveCommentId) {
      setActiveCommentId(null)
    }
  }

  return (
    <div className={'flex flex-col gap-3 w-full'}>
      <MantineTextEditor
        isComment
        initialContent={comment?.content ?? ''}
        handleCancel={resetEditorState}
        className={'max-h-max'}
        containerClassName={'[&>#tools]:bg-transparent'}
        replyData={replyData}
        handleSave={taskComment ? handleEditComment : handleCreateComment}
        onFileChange={handleFileSelect}
        onContentChange={(value) => {
          taskCommentStore.isEditTaskComment = true
          setComment((prevComment) => {
            if (!prevComment) {
              return { content: value } as ITaskComment
            }
            return {
              ...prevComment,
              content: value
            }
          })
        }}
      />
      {selectedFiles.length > 0 && (
        <Files
          files={selectedFiles}
          isSmall
          setSelectedFiles={setSelectedFiles}
          withAdditionalActions={false}
        />
      )}
    </div>
  )
}
