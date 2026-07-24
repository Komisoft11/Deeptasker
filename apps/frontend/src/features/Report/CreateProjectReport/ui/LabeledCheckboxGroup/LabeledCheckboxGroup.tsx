import { Checkbox } from '@radix-ui/react-checkbox'
import classNames from 'classnames'
import React, { FC, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CaretRight } from '@/shared/assets/images/icons'
import { ENTITY, TRANSLATION } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import styles from './LabeledCheckboxGroup.module.scss'


interface Props {
  label: string
  value: number[]
  onChange?: (value: number[]) => void
}

const MAX_VISIBLE = 3

export const LabeledCheckboxGroup: FC<Props> = ({ label, value, onChange }) => {
  const { t } = useTranslation([ENTITY, TRANSLATION])
  const {
    projectStore: { activeProject }
  } = useRootStore()
  const [expanded, setExpanded] = useState(false)

  const handleStatusToggle = (id: number) => {
    if (!onChange || !Array.isArray(value)) return

    const newValue = value.includes(id)
      ? value.filter((v) => v !== id)
      : [...value, id]
    onChange(newValue)
  }

  const visibleStatuses = expanded
    ? activeProject.statuses
    : activeProject.statuses.slice(0, MAX_VISIBLE)

  return (
    <div className="flex flex-col gap-2 pr-4">
      <p className="body-14-20 secondaryText">{label}</p>
      <div className="flex flex-wrap gap-1">
        {visibleStatuses.map((status) => (
          <div key={status.id} className="flex items-center gap-2">
            <Checkbox
              checked={value.includes(status.id)}
              onCheckedChange={() => handleStatusToggle(status.id)}
              className={styles.label}
            >
              <label className={'body-14-16'}>{t(status.name, { ns: ENTITY })}</label>
            </Checkbox>
          </div>
        ))}
        {activeProject.statuses.length > MAX_VISIBLE && (
          <Button
            styleButton={'filled'}
            colorButton={'dark'}
            className="flex items-center w-max px-3 h-10 body-14-16"
            onClick={() => setExpanded((prev) => !prev)}
          >
            {expanded ? t('less', { ns: TRANSLATION }) : t('more', { ns: TRANSLATION })}
            <CaretRight
              className={classNames(
                expanded ? 'rotate-180' : '',
                'w-4 h-4 icon'
              )}
            />
          </Button>
        )}
      </div>
    </div>
  )
}
