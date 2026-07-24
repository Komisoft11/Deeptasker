declare const __IS_DEV__: boolean
declare module 'vite-plugin-sass'

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>
    }
  : T
