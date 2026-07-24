import { reaction } from 'mobx'
import { observer, useLocalObservable } from 'mobx-react-lite'
import React, { FC, useRef, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { usePermissionProject } from '@/entities/Project'
import { useSprints } from '@/entities/Sprint/lib/hooks/useSprints'
import { Sprint } from '@/entities/Sprint/model/sprint'
import { EditableInput } from '@/entities/Sprint/ui/SprintUpdateForm/ui/EditableInput/EditableInput'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { CANCEL } from '@/shared/lib/helpers/shortcut.helper'
import { useKeyDown } from '@/shared/lib/hooks/useKeyDown'
import { DatePickerMantine } from '@/shared/ui/DatePickerMantine/DatePickerMantine'

interface Props {
  sprint: Sprint
}

interface FormValues {
  title: string
  description: string
  dateStart: Date
  dateEnd: Date
  _dateRange?: [Date, Date]
}
type EditableField = 'title' | 'description'

export const SprintUpdateForm: FC<Props> = observer(({ sprint }) => {
  const { updateAsync } = useSprints()
  const {
    permissions: { updateSprints }
  } = usePermissionProject()
  const [editStates, setEditStates] = useState<Record<EditableField, boolean>>({
    title: false,
    description: false
  })
  const descriptionRef = useRef<HTMLInputElement | null>(null)
  const titleRef = useRef<HTMLInputElement | null>(null)

  const { t } = useTranslation([TRANSLATION, ENTITY])

  const initialValues = {
    title: sprint.title || '',
    description: sprint.description || '',
    dateStart: sprint.dateStart || null,
    dateEnd: sprint.dateEnd || null,
    _dateRange: [sprint.dateStart, sprint.dateEnd] as [Date, Date]
  }

  const { control, handleSubmit, reset, setValue } = useForm<FormValues>({
    defaultValues: initialValues
  })

  const toggleEdit = (field: EditableField) => {
    setEditStates((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const handleCancel = () => {
    setEditStates({ title: false, description: false })
    reset(initialValues)
  }

  useKeyDown(descriptionRef, handleCancel, [CANCEL])
  useKeyDown(titleRef, handleCancel, [CANCEL])

  const onSubmit = async (data: FormValues) => {
    const { _dateRange, ...payload } = data
    const hasChanges = Object.keys(payload).some(
      (key) =>
        payload[key as keyof typeof payload] !==
        initialValues[key as keyof typeof initialValues]
    )
    if (!hasChanges) return
    await updateAsync.mutateAsync({ id: Number(sprint.id), updates: payload })
    setEditStates({ title: false, description: false })
  }

  useLocalObservable(() => ({
    dispose: reaction(
      () => [
        sprint.title,
        sprint.description,
        sprint.dateStart?.getTime?.(),
        sprint.dateEnd?.getTime?.()
      ],
      () => {
        reset({
          title: sprint.title || '',
          description: sprint.description || '',
          dateStart: sprint.dateStart ?? null,
          dateEnd: sprint.dateEnd ?? null,
          _dateRange: [sprint.dateStart, sprint.dateEnd] as [Date, Date]
        })
      }
    )
  }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col p-4'}>
      <div className={'w-full flex gap-3'}>
        <Controller
          control={control}
          name={'title'}
          render={({ field }) => (
            <EditableInput
              type={'title'}
              field={field}
              ref={titleRef}
              readOnly={!editStates.title}
              onEnter={() => {
                handleSubmit(onSubmit)()
                toggleEdit('title')
              }}
              onEdit={() => toggleEdit('title')}
            />
          )}
        />
        <div className={'flex flex-col gap-1 w-1/4 '}>
          <p className={'secondaryText body-12'}>
            {t('sprints.period', { ns: ENTITY })}
          </p>

          <Controller
            name='_dateRange'
            control={control}
            render={({ field }) => (
              <DatePickerMantine
                key={`${sprint.dateStart ?? null}-${sprint.dateEnd ?? null}`}
                isRange
                value={field.value}
                disabled={!updateSprints}
                onChange={(range) => {
                  field.onChange(range)
                  if (Array.isArray(range) && range[0] && range[1]) {
                    setValue('dateStart', range[0])
                    setValue('dateEnd', range[1])
                  }
                }}
                classNamesOverride={{
                  wrapper: 'h-10',
                  input: '!text-[14px] !leading-[16px]',
                  section: 'hidden'
                }}
                onDropdownClose={() => {
                  if (
                    Array.isArray(field.value) &&
                    field.value[0] &&
                    field.value[1]
                  ) {
                    setValue('dateStart', field.value[0])
                    setValue('dateEnd', field.value[1])
                    handleSubmit(onSubmit)()
                  } else {
                    setValue('dateStart', initialValues.dateStart)
                    setValue('dateEnd', initialValues.dateEnd)
                    reset({
                      ...initialValues,
                      _dateRange: [
                        initialValues.dateStart,
                        initialValues.dateEnd
                      ]
                    })
                  }
                }}
              />
            )}
          />
        </div>

        <Controller
          control={control}
          name={'description'}
          render={({ field }) => (
            <EditableInput
              type={'description'}
              field={field}
              ref={descriptionRef}
              readOnly={!editStates.description}
              onEnter={() => {
                handleSubmit(onSubmit)()
                toggleEdit('description')
              }}
              onEdit={() => toggleEdit('description')}
            />
          )}
        />
      </div>
    </form>
  )
})