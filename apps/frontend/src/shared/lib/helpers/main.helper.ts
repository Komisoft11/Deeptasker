import {
  consecutiveDashesRegex,
  slugSeparatorCharsRegex
} from '@/widgets/Project'

export const transformToSlug = (value: string): string => {
  return value
    .replace(slugSeparatorCharsRegex, '-')
    .replace(consecutiveDashesRegex, '-')
}

export function getRandomNumber(
  min: number,
  max: number,
  step: number
): number {
  const range = (max - min) / step
  return Math.floor(Math.random() * (range + 1)) * step + min
}

export function hasNonEmptyValue(obj: { [key: string]: any }): boolean {
  return Object.values(obj).some(
    (value) => value !== null && value !== undefined && value !== ''
  )
}

export const isEmpty = (obj: any): boolean => {
  for (let i in obj) return false
  return true
}

export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value)
}

export function isNumeric(value: unknown): value is number {
  return !!Number(value)
}

export function isString(value: unknown): value is string {
  return typeof value === 'string'
}

export function combineBetter<V>(keys: number[], values: V[]): V[] {
  let result: V[] = []
  for (let i = 0; i < keys.length; i++) result[keys[i]] = values[i]
  return result
}

export function cyrb53(str: string, seed: number = 0): number {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }

  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909)

  return 4294967296 * (2097151 & h2) + (h1 >>> 0)
}

export function existObject(obj: Object) {
  return Object.keys(obj).length > 2
}

export function getIndexFromObjects<T>(
  objects: T[],
  cb: (el: T) => boolean
): number {
  return objects.findIndex((el) => cb(el))
}

export function convertDateToDot(date: Date) {
  const time = date.toLocaleString().split(' ')[1]
  return (
    date.getDay() +
    '.' +
    date.getMonth() +
    '.' +
    date.getFullYear() +
    ' ' +
    time
  )
}

export function slug_url(title: string): string {
  let answer = '',
    a: any = {},
    i
  a['Ё'] = 'YO'
  a['Й'] = 'I'
  a['Ц'] = 'TS'
  a['У'] = 'U'
  a['К'] = 'K'
  a['Е'] = 'E'
  a['Н'] = 'N'
  a['Г'] = 'G'
  a['Ш'] = 'SH'
  a['Щ'] = 'SCH'
  a['З'] = 'Z'
  a['Х'] = 'H'
  a['Ъ'] = "'"
  a['ё'] = 'yo'
  a['й'] = 'i'
  a['ц'] = 'ts'
  a['у'] = 'u'
  a['к'] = 'k'
  a['е'] = 'e'
  a['н'] = 'n'
  a['г'] = 'g'
  a['ш'] = 'sh'
  a['щ'] = 'sch'
  a['з'] = 'z'
  a['х'] = 'h'
  a['ъ'] = "'"
  a['Ф'] = 'F'
  a['Ы'] = 'I'
  a['В'] = 'V'
  a['А'] = 'a'
  a['П'] = 'P'
  a['Р'] = 'R'
  a['О'] = 'O'
  a['Л'] = 'L'
  a['Д'] = 'D'
  a['Ж'] = 'ZH'
  a['Э'] = 'E'
  a['ф'] = 'f'
  a['ы'] = 'i'
  a['в'] = 'v'
  a['а'] = 'a'
  a['п'] = 'p'
  a['р'] = 'r'
  a['о'] = 'o'
  a['л'] = 'l'
  a['д'] = 'd'
  a['ж'] = 'zh'
  a['э'] = 'e'
  a['Я'] = 'Ya'
  a['Ч'] = 'CH'
  a['С'] = 'S'
  a['М'] = 'M'
  a['И'] = 'I'
  a['Т'] = 'T'
  a['Ь'] = "'"
  a['Б'] = 'B'
  a['Ю'] = 'YU'
  a['я'] = 'ya'
  a['ч'] = 'ch'
  a['с'] = 's'
  a['м'] = 'm'
  a['и'] = 'i'
  a['т'] = 't'
  a['ь'] = "'"
  a['б'] = 'b'
  a['ю'] = 'yu'
  const chars = [...title]
  for (i in chars) {
    if (chars.hasOwnProperty(i)) {
      if (a[chars[i]] === undefined) {
        answer += chars[i]
      } else {
        answer += a[chars[i]]
      }
    }
  }
  return answer
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-')
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))
