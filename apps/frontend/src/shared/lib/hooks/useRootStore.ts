import { useContext } from 'react'
import { RootContext } from '@/app/providers/RootProvider'
import { RootStore } from '@/entities/lib/stores/root.store'


export const useRootStore = () => useContext<RootStore>(RootContext)
