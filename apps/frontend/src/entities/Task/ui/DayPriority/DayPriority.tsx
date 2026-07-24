import { observer } from 'mobx-react-lite'
import React from 'react'
import styled from 'styled-components'
import { Task } from '@/entities/Task'
import { useBreakpoints } from '@/shared/lib/hooks/useBreakpoints'

interface Props {
  task: Task
}

const PRIORITY_COLORS: { [key: number]: string } = {
  // 1: 'var(--red)',
  // 2: 'var(--priority-medium)',
  // 3: '#ECCB1D',
  // 4: 'var(--primaryGray-800)',
  // 5: 'var(--blue-900)',
  // 6: 'var(--green-900)'
}

const getPriorityColor = (priority: number) => {
  return PRIORITY_COLORS[priority] || '#fff'
}

export const DayPriorityComponent = observer<Props>(({ task }) => {
  const { IS_MOBILE_OR_TABLET } = useBreakpoints()
  return (
    <DayPriority
      $bgPriorityColor={getPriorityColor(task.priorityPlanner || 0)}
      $IS_MOBILE_OR_TABLET={IS_MOBILE_OR_TABLET}
    >
      <p>{task.priorityPlanner}</p>
    </DayPriority>
  )
})

interface TaskKanbanPriorityProps {
  $bgPriorityColor: string
  $textPriorityColor?: string
  $IS_MOBILE_OR_TABLET: boolean
}

const DayPriority = styled.div<TaskKanbanPriorityProps>`
    display: flex;
    justify-content: center;
    align-items: center;
    width: ${(props) => (props.$IS_MOBILE_OR_TABLET ? '24px' : '26px')};
    height: ${(props) => (props.$IS_MOBILE_OR_TABLET ? '24px' : '26px')};
    border-radius: 8px;
    line-height: ${(props) => (props.$IS_MOBILE_OR_TABLET ? '14px' : '16px')};
    font-size: ${(props) => (props.$IS_MOBILE_OR_TABLET ? '12px' : '14px')};
    background-color: ${(props) => props.$bgPriorityColor}
}
`
