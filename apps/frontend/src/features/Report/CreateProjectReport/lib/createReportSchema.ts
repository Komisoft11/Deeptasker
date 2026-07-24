import * as yup from 'yup'
import { REPORT_FORMATS } from '@/features/Report/CreateProjectReport/const/formats'
import { INITIAL_SWITCH_STATES } from '@/features/Report/CreateProjectReport/const/switches'
import { ReportFields } from '@/entities/Report'

export const createReportSchema = yup.object().shape({
  title: yup.string().required('Введите название отчёта'),
  format: yup.string().oneOf(REPORT_FORMATS).required('Выберите формат'),
  statuses: yup.array().of(yup.number()).min(1, 'Выберите хотя бы один статус'),
  periodStart: yup.date().nullable().required('Выберите период'),
  periodEnd: yup.date().nullable().required('Выберите период'),
  fields: yup.object().shape(
    Object.keys(INITIAL_SWITCH_STATES).reduce((acc, key) => {
      acc[key as keyof ReportFields] = yup.boolean()
      return acc
    }, {} as Record<keyof ReportFields, yup.BooleanSchema>)
  )
})
