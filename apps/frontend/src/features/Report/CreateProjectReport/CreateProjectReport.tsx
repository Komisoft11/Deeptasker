import { yupResolver } from '@hookform/resolvers/yup'
import classNames from 'classnames'
import React, { useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  INITIAL_SWITCH_STATES,
  LEFT_SWITCH_LABELS,
  RIGHT_SWITCH_LABELS
} from '@/features/Report/CreateProjectReport/const/switches'
import { getPeriodRange } from '@/features/Report/CreateProjectReport/helpers/getPeriodRange'
import { createReportSchema } from '@/features/Report/CreateProjectReport/lib/createReportSchema'
import { ReportFields, ReportFormat } from '@/entities/Report'
import { useReports } from '@/entities/Report/lib/hooks/useReports'
import { Close, Plus } from '@/shared/assets/images/icons'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { Input } from '@/shared/ui/Input/Input'
import { Switch } from '@/shared/ui/Switch/Switch'
import { LabeledCheckboxGroup, LabeledRadioGroup, LabeledSelect } from './ui'


interface Props {
  className?: string
  isAddReport?: boolean
  setIsAddReport?: (isAddReport: boolean) => void
  containerClassName?: string
}

interface FormData {
  title: string
  format: ReportFormat
  statuses: number[]
  fields: Record<keyof ReportFields, boolean>
  periodStart: Date
  periodEnd: Date
}

export const CreateProjectReport = ({
  className,
  isAddReport,
  setIsAddReport,
  containerClassName
}: Props) => {
  const {
    projectStore: { activeProject }
  } = useRootStore()
  const { t } = useTranslation([ENTITY, TRANSLATION])
  const [period, setPeriod] = useState('')
  const { createAsync } = useReports(activeProject)

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    reset
  } = useForm<FormData>({
    resolver: yupResolver(createReportSchema),
    defaultValues: {
      title: '',
      format: 'csv',
      statuses: activeProject.statuses.map((s) => s.id),
      fields: { ...INITIAL_SWITCH_STATES }
    },
    mode: 'onChange'
  })

  const onSubmit = async (data: FormData) => {
    await createAsync.mutateAsync(data)
    setIsAddReport?.(false)

    formReset()
  }

  const formReset = () => {
    setPeriod('')

    reset({
      title: '',
      format: 'csv',
      statuses: activeProject.statuses.map((s) => s.id),
      periodStart: undefined,
      periodEnd: undefined,
      fields: { ...INITIAL_SWITCH_STATES }
    })
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={classNames(
        'flex flex-col justify-between h-full gap-4',
        className
      )}
    >
      <div
        className={classNames(
          'flex flex-col gap-6 p-4 pb-0',
          containerClassName
        )}
      >
        <div className='flex flex-col gap-2'>
          <h2>{t('report.createForm.title')}</h2>
          <p className='body-14-20 secondaryText'>
            {t('report.createForm.instructions')}
          </p>
        </div>

        <div className='flex gap-2'>
          <Controller
            name='title'
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                className='max-w-[480px] w-full'
                placeholder={
                  t('report.createForm.enterName', { ns: ENTITY }) as string
                }
                error={!!errors.title?.message}
                helperText={errors.title?.message}
                maxLength={64}
              />
            )}
          />
          <div className={'flex flex-col gap-1 w-full'}>
            <LabeledSelect
              value={period}
              onChange={(option) => {
                setPeriod(option)
                if (option !== 'report.createForm.periodSelect.custom') {
                  const range = getPeriodRange(option)
                  if (range) {
                    const [start, end] = range
                    setValue('periodStart', start as Date)
                    setValue('periodEnd', end as Date)
                  }
                }
              }}
              onCustomDateChange={(start, end) => {
                setValue('periodStart', start as Date)
                setValue('periodEnd', end as Date)
              }}
            />
            {(errors.periodEnd || errors.periodStart) && (
              <p className={'text-systemRed body-12'}>
                {errors.periodEnd?.message || errors.periodStart?.message}
              </p>
            )}
          </div>
        </div>

        <div className='flex'>
          <div className='flex flex-col gap-2  border-r border-border max-w-[480px] w-full'>
            <div className={'flex flex-col gap-1'}>
              <Controller
                name='statuses'
                control={control}
                render={({ field }) => (
                  <LabeledCheckboxGroup
                    label={t('report.createForm.taskStatus', { ns: ENTITY })}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.statuses && (
                <p className={'text-systemRed body-12'}>
                  {errors.statuses.message}
                </p>
              )}
            </div>
          </div>
          <div className='flex flex-col gap-2 pl-6'>
            <Controller
              name='format'
              control={control}
              render={({ field }) => (
                <LabeledRadioGroup
                  label={t('report.createForm.fileFormat', { ns: ENTITY })}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>
        </div>

        <div className='flex w-full'>
          {[
            {
              switches: LEFT_SWITCH_LABELS,
              className: 'border-r border-border pr-8'
            },
            { switches: RIGHT_SWITCH_LABELS, className: 'pl-8' }
          ].map(({ switches, className }, index) => (
            <div
              key={index}
              className={classNames('flex flex-col gap-2 w-full', className)}
            >
              {switches.map((item) => (
                <Controller
                  key={item.value}
                  name={`fields.${item.value}`}
                  control={control}
                  render={({ field }) => (
                    <Switch
                      label={item.label}
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      labelClassName='body-16 w-full hover:cursor-pointer'
                      containerClassName='flex justify-between w-full p-3 hover:bg-hover rounded-lg'
                    />
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className='w-full border-t border-border py-4 flex justify-center gap-2'>
        <Button
          styleButton='filled'
          icon={!isSubmitting && <Plus />}
          type={'submit'}
          disabled={isSubmitting}
          className='max-w-[174px] w-full body-16 h-max'
        >
          {isSubmitting
            ? t('submitting', { ns: TRANSLATION })
            : t('report.create', { ns: ENTITY })}
        </Button>

        {isAddReport && !isSubmitting && (
          <Button
            styleButton='filled'
            colorButton={'dark'}
            icon={<Close />}
            type={'button'}
            className='max-w-[174px] w-full body-16 h-max'
            onClick={() => setIsAddReport?.(false)}
          >
            {t('cancel', { ns: TRANSLATION })}
          </Button>
        )}
      </div>
    </form>
  )
}
