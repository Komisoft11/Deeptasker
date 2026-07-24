export const ltrim = (str: string, charsToRemove: string) => {
  let start = 0
  while (start < str.length && charsToRemove.includes(str[start])) {
    start++
  }
  return str.slice(start)
}
