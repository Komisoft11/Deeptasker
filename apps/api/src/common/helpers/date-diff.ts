import dayjs, { QUnitType } from 'dayjs'

export class DateDiff {
  constructor(
    private readonly date1: Date,
    private readonly date2: Date,
    private readonly isAbsolute: boolean = true
  ) {}

  public days(): number {
    return this.calculate('days')
  }

  public seconds() {
    return this.calculate('seconds')
  }

  public millisecond() {
    return this.calculate('millisecond')
  }

  private calculate(unit: QUnitType) {
    const diff = dayjs(this.date1).diff(this.date2, unit)

    if (this.isAbsolute) {
      return Math.abs(diff)
    }

    return diff
  }
}
