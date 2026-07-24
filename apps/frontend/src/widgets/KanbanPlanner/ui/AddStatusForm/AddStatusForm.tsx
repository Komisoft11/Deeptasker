import { UniqueIdentifier } from '@dnd-kit/core'
import { yupResolver } from '@hookform/resolvers/yup'
import React, { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { ColorPicker } from '@/features/ColorPicker/ColorPicker'
import { ITaskStatusCreateDto, useProjects } from '@/entities/Project'
import { colors } from '@/shared/const/colors'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { Input } from '@/shared/ui/Input/Input'
import styles from './AddStatusForm.module.scss'
import { addStatusSchema } from './lib/addStatusSchema'

interface Props {
  onCreate?: (statusId: UniqueIdentifier) => void
}

export const AddStatusForm: FC<Props> = ({ onCreate }) => {
  const {
    projectStore: { activeProject }
  } = useRootStore()

  const { createTaskStatusAsync } = useProjects()

  const { t } = useTranslation()

  const [statusColor, setStatusColor] = useState(() => {
    const randomIndex = Math.floor(Math.random() * colors.length)
    return colors[randomIndex]
  })

  const existingStatuses = activeProject.statuses.map((status) =>
    t(status.name)
  )

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ITaskStatusCreateDto>({
    resolver: yupResolver(addStatusSchema(existingStatuses)),
    mode: 'onChange'
  })

  const handleCreateTaskStatus = async (formValues: ITaskStatusCreateDto) => {
    const dto: ITaskStatusCreateDto = {
      ...formValues,
      color: statusColor
    }
    const status = await createTaskStatusAsync.mutateAsync([activeProject, dto])
    onCreate?.(status.id)
  }
  return (
    <form
      className={styles.addStatus}
      onSubmit={handleSubmit(handleCreateTaskStatus)}
    >
      <Input
        placeholder={'Введите название доски'}
        className={'border border-transparent rounded-lg'}
        autoFocus
        error={!!errors.name}
        helperText={errors.name?.message}
        {...register('name')}
      />
      <ColorPicker
        initialColor={statusColor}
        buttonClassName={'max-w-[calc(100%/4-8px)] w-full'}
        setColor={(color) => {
          setStatusColor(color)
        }}
        classNamePalette={'w-full p-0 justify-normal'}
      />

      <Button
        styleButton={'filled'}
        className={'w-1/2 py-2 px-3 body-16'}
        type={'submit'}
        disabled={!!errors.name}
      >
        Создать доску
      </Button>
    </form>
  )
}
