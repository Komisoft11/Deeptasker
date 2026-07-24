import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useCallback, useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { SprintsFilter } from '@/widgets/FilterSidebar/ui/SprintsFilter/SprintsFilter'
import { TagsFilter } from '@/widgets/FilterSidebar/ui/TagsFilter/TagsFilter'
import { UserFilter } from '@/widgets/FilterSidebar/ui/UserFilter/UserFilter'
import { StatusesFilter } from '@/features/Task/StatusesFilter/StatusesFilter'
import { useTaskFilters } from '@/entities/Task'
import { Close } from '@/shared/assets/images/icons'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { useCurrentView } from '@/shared/lib/hooks/useCurrentView'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { DateRange } from '@/shared/types/time.interface'
import { Button } from '@/shared/ui/Button/Button'
import { Checkbox } from '@/shared/ui/Checkbox/Checkbox'
import { FooterButton } from '@/shared/ui/FooterButton/FooterButton'
import styles from './FilterSidebar.module.scss'
import { DateFilter } from './ui/DateFilter/DateFilter'
import { PrioritiesFilter } from './ui/PrioritiesFilter/PrioritiesFilter'


interface IFilters {
  creation: DateRange
  finish: DateRange
  deadline: DateRange
  isOverdue: boolean
  assigner: number[]
  executor: number[]
  status: number[]
  priority: number[]
  tags: number[]
  folderId: number[]
  sprintId: number[]
}

const emptyFilters: IFilters = {
  creation: null,
  finish: null,
  deadline: null,
  isOverdue: false,
  assigner: [],
  executor: [],
  status: [],
  priority: [],
  tags: [],
  folderId: [],
  sprintId: []
}

export const FilterSidebar = observer(() => {
  const {
    sidebarStore,
    projectStore: { activeProject },
    taskFilterStore,
    sprintStore
  } = useRootStore()

  const { activeFilters, activeFiltersMap } = taskFilterStore
  const isActiveFilters = Boolean(activeFilters.length)

  const { t } = useTranslation([ENTITY, TRANSLATION])
  const { isTableView } = useCurrentView()

  const { updateFilters, clearFilters } = useTaskFilters()

  const isTagsHidden = !activeProject.tags.length

  const {
    control,
    handleSubmit,
    formState: { isDirty },
    reset
  } = useForm<IFilters>({
    mode: 'onSubmit',
    defaultValues: activeFiltersMap
  })

  const handleFilter = (data: IFilters) => {
    updateFilters(data)
    reset(data)
  }

  const handleClear = useCallback(() => {
    reset(emptyFilters)
    clearFilters()
  }, [reset, clearFilters])

  useEffect(() => {
    reset(activeFiltersMap)
  }, [activeFilters.length])

  return (
    <form
      onSubmit={handleSubmit(handleFilter)}
      className={classNames(
        styles.sidebar,
        { [styles.open]: sidebarStore.isRightOpen },
        'scrollbarContainerOnBg'
      )}
    >
      <div className={classNames(styles.item, styles.header)}>
        <h3 className={'flex justify-center items-center h-10'}>
          {t('filters.label', { ns: TRANSLATION })}
        </h3>
        <div className={'flex gap-1'}>
          <Button
            styleButton={'filled'}
            colorButton={'dark'}
            onClick={handleClear}
            className={classNames(
              'body-14-16 !py-2 px-3',
              !(isActiveFilters || isDirty) && 'withNoOpacity'
            )}
          >
            {t('clear', { ns: TRANSLATION })}
          </Button>
          <div
            className={'iconContainer'}
            onClick={() => sidebarStore.closeRightSidebar()}
          >
            <Close className={'icon'} />
          </div>
        </div>
      </div>
      <div className={'overflow-y-auto '}>
        <div className={classNames(styles.item, styles.filter)}>
          <label className={'body-14-16 secondaryText'}>
            {t('orderItems.dateCreated', { ns: TRANSLATION })} (
            {t('from', { ns: TRANSLATION })} - {t('to', { ns: TRANSLATION })})
          </label>
          <Controller
            control={control}
            name={'creation'}
            render={({ field: { onChange, value } }) => (
              <DateFilter
                onChange={onChange}
                value={value}
                maxDate={new Date()}
              />
            )}
          />
        </div>
        <div className={classNames(styles.item, styles.filter)}>
          <label className={'body-14-16 secondaryText'}>
            {t('orderItems.dateCompleted', { ns: TRANSLATION })} (
            {t('from', { ns: TRANSLATION })} - {t('to', { ns: TRANSLATION })})
          </label>
          <Controller
            control={control}
            name={'finish'}
            render={({ field: { onChange, value } }) => (
              <DateFilter
                onChange={onChange}
                value={value}
                maxDate={new Date()}
              />
            )}
          />
        </div>
        <div className={classNames(styles.item, styles.filter)}>
          <label className={'body-14-16 secondaryText'}>
            {t('deadline', { ns: TRANSLATION })} (
            {t('from', { ns: TRANSLATION })} - {t('to', { ns: TRANSLATION })})
          </label>
          <Controller
            control={control}
            name={'deadline'}
            render={({ field: { onChange, value } }) => (
              <DateFilter onChange={onChange} value={value} />
            )}
          />
          <Controller
            control={control}
            name={'isOverdue'}
            render={({ field: { onChange, value } }) => (
              <Checkbox
                classNameLabel={'body-14-20'}
                label={t('task.overdue', { ns: ENTITY })}
                onCheckedChange={onChange}
                checked={value}
              />
            )}
          />
        </div>
        {isTableView && sprintStore.sprints.length > 0 && (
          <div className={classNames(styles.item, styles.filter)}>
            <label className={'body-14-16 secondaryText'}>Спринт</label>
            <Controller
              control={control}
              name={'sprintId'}
              render={({ field: { onChange, value } }) => (
                <SprintsFilter onChange={onChange} value={value} />
              )}
            />
          </div>
        )}
        <div className={classNames(styles.item, styles.filter)}>
          <label>{t('task.info.assigner', { ns: ENTITY })}</label>
          <Controller
            control={control}
            name={'assigner'}
            render={({ field: { onChange, value } }) => (
              <UserFilter name={'assigner'} onChange={onChange} value={value} />
            )}
          />
        </div>
        <div className={classNames(styles.item, styles.filter)}>
          <label>{t('task.info.executor', { ns: ENTITY })}</label>
          <Controller
            control={control}
            name={'executor'}
            render={({ field: { onChange, value } }) => (
              <UserFilter name={'executor'} onChange={onChange} value={value} />
            )}
          />
        </div>
        <div className={classNames(styles.item, styles.filter)}>
          <label>{t('task.taskStatus.title', { ns: ENTITY })}</label>
          <Controller
            control={control}
            name={'status'}
            render={({ field: { onChange, value } }) => (
              <StatusesFilter
                statuses={activeProject.statuses}
                onChange={onChange}
                initialValue={value}
              />
            )}
          />
        </div>
        <div className={classNames(styles.item, styles.filter)}>
          <label>{t('orderItems.priority', { ns: TRANSLATION })}</label>
          <Controller
            control={control}
            name={'priority'}
            render={({ field: { onChange, value } }) => (
              <PrioritiesFilter onChange={onChange} initialPriorities={value} />
            )}
          />
        </div>
        <div
          className={classNames(
            styles.item,
            styles.filter,
            isTagsHidden && 'hidden'
          )}
        >
          <label>{t('project.tag.label', { ns: ENTITY })}</label>
          <Controller
            control={control}
            name={'tags'}
            render={({ field: { onChange, value } }) => (
              <TagsFilter
                tags={activeProject.tags}
                onChange={onChange}
                initialTags={value}
              />
            )}
          />
        </div>
      </div>
      <FooterButton
        type={'submit'}
        styleButton={'filled'}
        colorButton={'accent'}
        buttonText={t('filters.apply', { ns: TRANSLATION })}
        className={classNames('sticky mt-auto', !isDirty && 'hidden')}
      />
    </form>
  )
})
