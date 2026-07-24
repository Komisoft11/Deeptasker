import { MouseEvent } from 'react'

const useStopPropagation = () => {
  const handleStopPropagation = (e: MouseEvent) => {
    e.stopPropagation()
  }
  return {
    handleStopPropagation
  }
}

export default useStopPropagation
