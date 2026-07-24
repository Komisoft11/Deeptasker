import dayjs from 'dayjs'

export const getPeriodRange = (option: string): [Date, Date] | null => {
  const today = dayjs()

  switch (option) {
    case 'report.createForm.periodSelect.lastWeek':
      return [
        today.subtract(7, 'day').startOf('day').toDate(),
        today.endOf('day').utc().toDate()
      ]
    case 'report.createForm.periodSelect.lastMonth':
      return [
        today.subtract(1, 'month').startOf('day').toDate(),
        today.endOf('day').utc().toDate()
      ]
    case 'report.createForm.periodSelect.lastYear':
      return [
        today.subtract(1, 'year').startOf('day').toDate(),
        today.endOf('day').utc().toDate()
      ]
    default:
      return null
  }
}
