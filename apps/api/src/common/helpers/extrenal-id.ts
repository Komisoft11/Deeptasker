import { REG_EXP_PROJECT_COUNT_SLUG } from '../const/const'

export const generateTaskExternalId = (projectSlug: string, position: number): string => {
  const match = projectSlug.match(REG_EXP_PROJECT_COUNT_SLUG)
  const base = match[1].toUpperCase()
  const count = match[2] || null

  const names = base.split('-')

  let externalId = ''

  if (names.length > 1) {
    externalId = names[0][0] + names[1][0]
  } else {
    externalId = names[0].slice(0, 2)
  }

  if (count) {
    externalId = externalId + count
  }

  return externalId + `-${position}`
}
