import classNames from 'classnames'
import React from 'react'
import { Close, Edit } from '@/shared/assets/images/icons'


type Props = {
  isEditing: boolean
  startEditing: () => void
  cancelEditing: () => void
}

export const EditIcon = ({ isEditing, startEditing, cancelEditing }: Props) => {
  return (
    <div
      className={classNames('iconContainer h-max', isEditing && 'bg-objects')}
      onClick={isEditing ? cancelEditing : startEditing}
    >
      {isEditing ? <Close className='icon' /> : <Edit className='icon' />}
    </div>
  )
}
