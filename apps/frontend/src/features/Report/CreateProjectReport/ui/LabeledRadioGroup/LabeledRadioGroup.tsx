import { RadioGroup, RadioGroupItem } from '@radix-ui/react-radio-group'
import React from 'react'
import { REPORT_FORMATS } from '@/features/Report/CreateProjectReport/const/formats'
import { ReportFormat } from '@/entities/Report'
import styles from './LabeledRadioGroup.module.scss'

interface Props {
  label: string
  value: ReportFormat
  onChange?: (value: ReportFormat) => void
}

export const LabeledRadioGroup = ({ label, value, onChange }: Props) => {
  return (
    <div className='flex flex-col gap-2'>
      <p className='body-14-20 secondaryText'>{label}</p>
      <RadioGroup
        aria-label={label}
        className={'flex gap-1'}
        value={value}
        onValueChange={onChange}
      >
        {REPORT_FORMATS.map((format) => (
          <RadioGroupItem key={format} value={format} className={styles.label}>
            <label className={'body-14-16'}>.{format}</label>
          </RadioGroupItem>
        ))}
      </RadioGroup>
    </div>
  )
}
