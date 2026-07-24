import { useCallback, useState } from 'react'

export interface IDialogReturn {
  open: boolean
  onOpenChange: (visible: boolean) => void
}

const useDialogAndPopover = (
  defaultVisible: boolean = false
): IDialogReturn => {
  const [open, setOpen] = useState(defaultVisible)

  const onOpenChange = useCallback((visible: boolean) => {
    setOpen(visible)
  }, [])

  return {
    open,
    onOpenChange
  }
}

export default useDialogAndPopover
