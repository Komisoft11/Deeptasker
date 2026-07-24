export function cacheKeyCreator(...args: unknown[]): string {
  if (!args.length) {
    throw Error('No argument provided')
  }

  return args.join('_')
}
