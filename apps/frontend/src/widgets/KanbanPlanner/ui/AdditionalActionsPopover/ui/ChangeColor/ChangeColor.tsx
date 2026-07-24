import classNames from 'classnames'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ColorPicker } from '@/features/ColorPicker/ColorPicker'
import { ITaskStatus, useProjects } from '@/entities/Project'
import { CaretDown, CaretUp } from '@/shared/assets/images/icons'
import { Palette } from '@/shared/assets/images/icons/textEditorIcons'
import { ENTITY } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'


interface Props {
  statusColor: string
  setStatusColor: (statusColor: string) => void
  status: ITaskStatus
  hasBaseActions: boolean
}

export const ChangeColor = ({
  statusColor,
  setStatusColor,
  status,
  hasBaseActions
}: Props) => {
  const { updateTaskStatusAsync } = useProjects()
  const { t } = useTranslation([ENTITY])
  const {
    projectStore: { activeProject }
  } = useRootStore()
  const [isChangeColor, setIsChangeColor] = useState<boolean>(false)

  const handleChangeColor = async (color: string) => {
    const previousColor = statusColor
    setStatusColor(color)

    try {
      await updateTaskStatusAsync.mutateAsync([
        activeProject,
        { id: status.id, color }
      ])
    } catch (error) {
      setStatusColor(previousColor)
    }
  }

  return (
    <div
      className={classNames(
        'border-b  border-hover pb-2 ',
        hasBaseActions && 'border-t pt-2'
      )}
    >
      <div
        className={classNames(
          'flex flex-col gap-2 ',
          isChangeColor && 'bg-hover rounded-lg pb-2 border-transparent'
        )}
      >
        <div
          className={classNames(
            'flex justify-between items-center py-1 rounded-lg pr-2',
            !isChangeColor && 'hover:bg-hover'
          )}
          onClick={() => setIsChangeColor(!isChangeColor)}
        >
          <div className='flex items-center'>
            <div className='p-2'>
              <Palette className='icon w-5 h-5' />
            </div>
            <p className={'body-14-16'}>
              {t('kanban.board.changeColor', { ns: ENTITY })}
            </p>
          </div>
          {!isChangeColor ? (
            <CaretDown className='icon w-5 h-5' />
          ) : (
            <CaretUp className='icon w-5 h-5' />
          )}
        </div>
        {isChangeColor && (
          <ColorPicker
            initialColor={statusColor}
            buttonClassName='max-w-9 w-full'
            setColor={(color) => handleChangeColor(color)}
            classNamePalette='w-full p-0 bg-transparent'
          />
        )}
      </div>
    </div>
  )
}
