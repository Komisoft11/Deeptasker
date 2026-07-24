import { ReactNode, createContext } from 'react'
import { rootStore } from '@/app/providers/MainProvider'
import { RootStore } from '@/entities/lib/stores/root.store'

export const RootContext = createContext<RootStore>(rootStore)

const RootProvider = ({ children }: { children: ReactNode }) => {
  return (
    <RootContext.Provider value={rootStore}>{children}</RootContext.Provider>
  )
}

export default RootProvider
