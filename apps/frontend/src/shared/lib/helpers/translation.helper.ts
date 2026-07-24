import { TOptions } from 'i18next'
import { TRANSLATION } from '@/shared/const/translation'


export function nsObject(values: string[] = []): TOptions {
  if (!values.length) {
    values = [TRANSLATION]
  }
  return {
    ns: values
  }
}
