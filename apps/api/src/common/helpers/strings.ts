export const transformToSlug = (value: string): string => {
  return value
    .replace(/[_\s]+/g, '-')
    .replace(/--+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
}
