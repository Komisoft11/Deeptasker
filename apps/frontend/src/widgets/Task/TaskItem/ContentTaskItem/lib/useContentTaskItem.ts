import { useEffect, useRef, useState } from 'react'
import ReactQuill from 'react-quill'
import { ModeEditorType } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/ui/CommentEditor/CommentEditor'
import { usePermissionTask, useTasks } from '@/entities/Task'
import useDebounce from '@/shared/lib/hooks/useDebounce'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'


export const useContentTaskItem = () => {
  const { taskStore } = useRootStore()
  const { activeTask } = taskStore
  const [modeEditor, setModeEditor] = useState<ModeEditorType>('view')
  const editorRef = useRef<ReactQuill>(null)
  const [isWrite, setIsWrite] = useState(false)
  const { updateAsync } = useTasks()
  const debounceTitle = useDebounce(activeTask.title, 500)

  const { canEditTitleTask, canEditDescriptionTask } =
    usePermissionTask(activeTask)

  useEffect(() => {
    if (
      isWrite &&
      debounceTitle !== '' &&
      canEditTitleTask &&
      canEditDescriptionTask
    ) {
      updateAsync
        .mutateAsync({
          dto: { title: debounceTitle },
          id: activeTask.id
        })
        .then(() => {
          setIsWrite(false)
        })
    }
  }, [debounceTitle])

  const handleChangeTitle = (newTitle: string) => {
    setIsWrite(true)
    updateAsync
      .mutateAsync({
        dto: { title: newTitle },
        id: activeTask.id
      })
      .then(() => {
        setIsWrite(false)
      })
  }

  const handleSaveContent = async (content: string) => {
    if (content === activeTask.content || !content) {
      return
    }

    await updateAsync.mutateAsync({
      dto: { content },
      id: activeTask.id
    })
  }

  return {
    modeEditor,
    editorRef,
    handleSaveContent,
    handleChangeTitle,
    setModeEditor
  }
}
