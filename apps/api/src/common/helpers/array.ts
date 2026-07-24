export const asyncFilter = async<T> (arr: T[], predicate: (el: T) => Promise<boolean>): Promise<T[]> => {
  const results = await Promise.all(arr.map(predicate));

  return arr.filter((_v, index) => results[index]);
}