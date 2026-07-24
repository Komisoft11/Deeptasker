import React, { useState } from 'react'
import useStopPropagation from '@/shared/lib/hooks/useStopPropagation'
import { ArrowIcon } from '@/shared/ui/Icon/ArrowIcon/ArrowIcon'

interface Props {
  isDefaultCollapsed?: boolean
  className?: string
  onClick?: () => void
}

export const ButtonCollapse = ({
  isDefaultCollapsed = true,
  onClick,
  className
}: Props) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(isDefaultCollapsed)
  const { handleStopPropagation } = useStopPropagation()
  const handleCollapse = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    handleStopPropagation(e)
    setIsCollapsed((prev) => !prev)
    onClick?.()
  }

  return (
    <ArrowIcon
      direction={isCollapsed ? 'right' : 'bottom'}
      onClick={handleCollapse}
      className={className}
    />
  )
}
