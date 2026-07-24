import { observer } from 'mobx-react-lite'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MantineTextEditor } from '@/widgets/MantineTextEditor/MantineTextEditor'
import { usePermissionTask, useTasks } from '@/entities/Task'
import { MAX_FILE_SIZE } from '@/shared/const/file'
import { ERRORS } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'
import { useContentTaskItem } from './lib/useContentTaskItem'

export const ContentTaskItem = observer(() => {
  const {
    taskStore: { activeTask }
  } = useRootStore()
  const { uploadFileAsync } = useTasks()
  const { handleSaveContent } = useContentTaskItem()
  const { canEditDescriptionTask } = usePermissionTask(activeTask)
  const { t } = useTranslation([ERRORS])

  const [description, setDescription] = useState(activeTask.content || '')

  const handleFileChange = async (selectedFiles: FileList | null) => {
    if (!selectedFiles?.length) return

    const validFiles: File[] = []
    const rejectedFiles: File[] = []

    Array.from(selectedFiles).forEach((file) => {
      if (file.size > MAX_FILE_SIZE) {
        rejectedFiles.push(file)
      } else {
        validFiles.push(file)
      }
    })

    if (rejectedFiles.length > 0) {
      showToast({
        title: t('fileMaxSize', { ns: ERRORS }),
        type: 'error'
      })
    }

    if (validFiles.length === 0) return

    const uploadPromises = validFiles.map((file) =>
      uploadFileAsync.mutateAsync({ task: activeTask, file })
    )

    await Promise.all(uploadPromises)
  }

  const handleContentChange = useCallback(
    (value: string) => {
      setDescription(value)
    },
    [activeTask.id]
  )

  return (
    <MantineTextEditor
      key={activeTask.id + activeTask.content}
      contentClassName={'min-h-[80px] !max-h-max'}
      className={'!max-h-max'}
      containerClassName={'flex-1'}
      wrapperClassName={'flex flex-col h-full'}
      initialContent={activeTask.content}
      onContentChange={handleContentChange}
      handleSave={() => handleSaveContent(description)}
      onFileChange={handleFileChange}
      withDraft
      mode={canEditDescriptionTask ? 'default' : 'readonly'}
    />
  )
})
