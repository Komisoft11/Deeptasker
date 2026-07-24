import dayjs from 'dayjs'

export const calculatePeriod = (option: string) => {
  const today = dayjs()
  switch (option) {
    case 'report.createForm.periodSelect.lastWeek':
      return `(${today
        .subtract(7, 'day')
        .format('DD.MM.YYYY')} - ${today.format('DD.MM.YYYY')})`
    case 'report.createForm.periodSelect.lastMonth':
      return `(${today
        .subtract(1, 'month')
        .format('DD.MM.YYYY')} - ${today.format('DD.MM.YYYY')})`
    case 'report.createForm.periodSelect.lastYear':
      return `(${today
        .subtract(1, 'year')
        .format('DD.MM.YYYY')} - ${today.format('DD.MM.YYYY')})`
    default:
      return ''
  }
}
