import { runInAction } from 'mobx'
import { Task } from '@/entities/Task'
import { TaskService } from '@/entities/Task/services/task.service'

interface IUseAIGenerator {
  generateTitle: (task: Task) => Promise<string>
  isTitleLong: (task: Task) => boolean
}

const useAIGenerator = (): IUseAIGenerator => {
  const generateTitle = async (task: Task): Promise<string> => {
    const generatedTitle: string = await TaskService.generateTitle(task.title)

    await TaskService.update({
      id: task.id,
      dto: {
        title: generatedTitle,
        content: task.content
          ? `${generatedTitle}<br>${task.content}`
          : generatedTitle
      }
    })

    runInAction(() => {
      task.content = `${task.title}<br>${task.content}`
      task.title = generatedTitle
    })

    return generatedTitle
  }

  const isTitleLong = (task: Task): boolean => task.title.length > 80

  return { generateTitle, isTitleLong }
}

export default useAIGenerator
