import {
  Dispatch,
  FC,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useState
} from 'react'

interface KanbanControlsContextValue {
  isAddStatus: boolean
  setIsAddStatus: Dispatch<SetStateAction<boolean>>
}

const KanbanControlsContext = createContext<
  KanbanControlsContextValue | undefined
>(undefined)

export const useKanbanControlsContext = () => {
  const context = useContext(KanbanControlsContext)
  if (!context) {
    throw new Error(
      'useKanbanControlsContext must be used within a KanbanControlsProvider'
    )
  }
  return context
}

export const KanbanControlsProvider: FC<{ children: ReactNode }> = ({
  children
}) => {
  const [isAddStatus, setIsAddStatus] = useState(false)

  const contextValue: KanbanControlsContextValue = {
    isAddStatus,
    setIsAddStatus
  }

  return (
    <KanbanControlsContext.Provider value={contextValue}>
      {children}
    </KanbanControlsContext.Provider>
  )
}
