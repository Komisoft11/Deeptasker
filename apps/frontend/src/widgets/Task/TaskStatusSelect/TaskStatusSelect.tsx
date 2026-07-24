import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'
import { ITaskStatus } from '@/entities/Project'
import { Select } from '@/shared/ui/Select/Select'

interface Props {
  currentStatus: ITaskStatus
  statuses: ITaskStatus[]
  changeTaskStatus: (newStatusId: string) => void
  canChangeStatus?: boolean
  disabled?: boolean
  className?: string
  target?: HTMLElement
}

export const TaskStatusSelect = ({
  currentStatus,
  statuses,
  changeTaskStatus,
  canChangeStatus = true,
  disabled = false,
  className,
  target
}: Props) => {
  const { t } = useTranslation()

  const renderStatus = (status: ITaskStatus, withCircle: boolean) => (
    <div className={'flex gap-2 items-center'}>
      {withCircle && <Circle borderColor={status?.color ?? ''} />}
      <p className={'break-all line-clamp-2 body-14-16'}>
        {t(status?.name ?? '')}
      </p>
    </div>
  )

  return (
    <Select
      disabled={disabled}
      value={currentStatus.id + ''}
      onValueChange={changeTaskStatus}
    >
      <Select.Trigger
        aria-label={currentStatus.id + ''}
        style={{ borderColor: currentStatus.color }}
        disabled={!canChangeStatus}
        className={classNames(
          className,
          (disabled || !canChangeStatus) && 'disabled'
        )}
      >
        {renderStatus(currentStatus, false)}
      </Select.Trigger>
      <Select.Portal container={target ?? document.body}>
        <Select.Content
          data-no-dnd={true}
          viewportProps={{
            style: { width: '180px' },
            className: 'flex flex-col gap-1'
          }}
        >
          {statuses.map((taskStatus) => (
            <Select.Item key={taskStatus.id} value={taskStatus.id + ''}>
              {renderStatus(taskStatus, true)}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Portal>
    </Select>
  )
}

interface ICircleProps {
  borderColor: string
}

const Circle = styled.div<ICircleProps>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1px solid ${(props) => props.borderColor};
`
