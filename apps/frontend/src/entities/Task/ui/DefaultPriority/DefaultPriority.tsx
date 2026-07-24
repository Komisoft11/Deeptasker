import { observer } from 'mobx-react-lite'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { Task } from '@/entities/Task'
import {
  IPriorityOption,
  findPriority
} from '@/entities/Task/services/task-priorities'
import { useBreakpoints } from '@/shared/lib/hooks/useBreakpoints'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'


interface Props {
  task: Task
}

export const DefaultPriority = observer<Props>(({ task }) => {
  const { IS_MOBILE_OR_TABLET } = useBreakpoints()
  const { themeModeStore } = useRootStore()
  const { t } = useTranslation()
  const priority: IPriorityOption = findPriority(
    task.priority,
    themeModeStore.mode
  )
  return (
    <Priority
      $bgPriorityColor={priority.colorBg}
      $IS_MOBILE_OR_TABLET={IS_MOBILE_OR_TABLET}
    >
      <p>{t(priority.label)}</p>
    </Priority>
  )
})

interface TaskKanbanPriorityProps {
  $bgPriorityColor: string
  $IS_MOBILE_OR_TABLET: boolean
}

const Priority = styled.div<TaskKanbanPriorityProps>`
  display: flex;
  background-color: ${(props) => props.$bgPriorityColor};
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  line-height: 16px;
  font-size: 14px;
`
