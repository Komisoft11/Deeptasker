import * as dayjs from 'dayjs'
import { ManipulateType } from 'dayjs'

export const getExpiryDate = (originalDate: dayjs.Dayjs, addTime?: string): dayjs.Dayjs => {
	const time = addTime || process.env.JWT_EXPIRES_IN || '5m'
	const [period, unit] = time.match(/\d+|\D+/g)

	return dayjs(originalDate).add(Number(period), unit as ManipulateType)
}
