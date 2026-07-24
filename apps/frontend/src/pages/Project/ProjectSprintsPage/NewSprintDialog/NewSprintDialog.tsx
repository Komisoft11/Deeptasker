import { yupResolver } from '@hookform/resolvers/yup'
import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { Dispatch, SetStateAction } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { createSprintSchema } from '@/entities/Sprint/lib/createSprintSchema'
import { useSprints } from '@/entities/Sprint/lib/hooks/useSprints'
import { SprintStatuses } from '@/entities/Sprint/model/types/sprint.types'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { DateRange } from '@/shared/types/time.interface'
import { Button } from '@/shared/ui/Button/Button'
import { DatePickerMantine } from '@/shared/ui/DatePickerMantine/DatePickerMantine'
import { Dialog } from '@/shared/ui/Dialog/Dialog'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'
import { Input } from '@/shared/ui/Input/Input'


interface Props {
  setIsAddSprint: Dispatch<SetStateAction<boolean>>
  isAddSprint: boolean
}

interface FormValues {
  title: string
  description?: string
  projectId: number
  status: SprintStatuses
  dateStart: Date | null
  dateEnd: Date | null
  _dateRange?: DateRange
}

export const NewSprintDialog = observer(
  ({ setIsAddSprint, isAddSprint }: Props) => {
    const {
      sprintStore: { isTitleExists }
    } = useRootStore()
    const { t } = useTranslation([ENTITY, TRANSLATION])

    const { createAsync } = useSprints()

    const {
      projectStore: { activeProject }
    } = useRootStore()

    const {
      control,
      handleSubmit,
      setValue,
      formState: { errors },
      reset
    } = useForm<FormValues>({
      resolver: yupResolver(
        createSprintSchema(function (value: string) {
          if (value) {
            return !isTitleExists(value)
          }
          return true
        })
      ),
      defaultValues: {
        title: '',
        description: '',
        projectId: activeProject.id,
        dateStart: null,
        dateEnd: null
      },
      mode: 'onChange'
    })

    const onSubmit = async (data: FormValues) => {
      const { _dateRange, ...payload } = data
      if (payload.dateEnd != null && payload.dateStart != null) {
        await createAsync.mutateAsync({
          ...payload,
          dateEnd: payload.dateEnd,
          dateStart: payload.dateStart
        })
        setIsAddSprint(false)
        reset()
      }
    }

    const handleClose = () => {
      setIsAddSprint(false)
      reset()
    }

    const handleButtonSubmit = (
      e: React.MouseEvent<HTMLButtonElement, MouseEvent>
    ) => {
      e.preventDefault()
      e.stopPropagation()
      handleSubmit(onSubmit)()
    }

    return (
      <Dialog onOpenChange={handleClose} open={isAddSprint}>
        <Dialog.Content
          title={t('sprints.addingNewSprint', { ns: ENTITY })}
          className={classNames(
            'radix-dialog-sprint-creation',
            'h-max w-[892px] z-[999]'
          )}
        >
          <form
            className={'flex flex-col gap-6'}
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className={'flex flex-col'}>
              <HorizontalLayout
                labelText={t('name', { ns: TRANSLATION })}
                className={'w-[150px] shrink-0'}
              >
                <Controller
                  name='title'
                  control={control}
                  rules={{ required: 'Название обязательно' }}
                  render={({ field }) => (
                    <Input
                      {...field}
                      placeholder={
                        t('sprints.enterNewSprintName', {
                          ns: ENTITY
                        }) as string
                      }
                      error={!!errors.title}
                      helperText={errors.title?.message}
                      maxLength={255}
                    />
                  )}
                />
              </HorizontalLayout>
              <HorizontalLayout
                labelText={t('description', { ns: TRANSLATION })}
                className={'w-[150px] shrink-0'}
              >
                <Controller
                  name='description'
                  control={control}
                  render={({ field }) => (
                    <textarea
                      {...field}
                      className={classNames(
                        'p-3 pr-0 bg-hover rounded-lg resize-none border',
                        'min-h-[80px] body-14-16 scrollbarContainerOnObjects w-full'
                      )}
                      maxLength={100}
                      placeholder={
                        t('addNewDescription', { ns: TRANSLATION }) as string
                      }
                    />
                  )}
                />
              </HorizontalLayout>
              <HorizontalLayout
                labelText={t('sprints.period', { ns: ENTITY })}
                className={'w-[150px] shrink-0'}
              >
                <div className={'flex flex-col gap-1 w-full'}>
                  <Controller
                    name='_dateRange'
                    control={control}
                    defaultValue={[null, null]}
                    render={({ field }) => (
                      <DatePickerMantine
                        isRange
                        value={field.value as DateRange}
                        onChange={(range) => {
                          field.onChange(range)
                          if (Array.isArray(range) && range.length === 2) {
                            setValue('dateStart', range[0])
                            setValue('dateEnd', range[1])
                          }
                        }}
                        classNamesOverride={{
                          input: '!text-[14px] !leading-[20px]',
                          wrapper: 'bg-hover h-10',
                          root: 'rounded-lg w-[280px] mr-auto'
                        }}
                        dropdownType='popover'
                        popoverProps={{ withinPortal: false }}
                      />
                    )}
                  />
                  {(errors.dateStart || errors.dateEnd) && (
                    <p className={'body-12 text-systemRed'}>
                      {errors.dateStart?.message || errors.dateEnd?.message}
                    </p>
                  )}
                </div>
              </HorizontalLayout>
            </div>
            <Button
              styleButton={'filled'}
              className={'max-w-[120px]'}
              type='button'
              onClick={handleButtonSubmit}
            >
              {t('create', { ns: TRANSLATION })}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog>
    )
  }
)
