import { useState } from 'react'
import { LocalStorageHelper } from '@/shared/lib/helpers/local-storage.helper'
import { Switch } from '@/shared/ui/Switch/Switch'

export const ShowIdSwitcher = () => {
  const [isChecked, setIsChecked] = useState(LocalStorageHelper.getIsShowId())

  const handleCheck = (checked: boolean) => {
    setIsChecked(checked)
    LocalStorageHelper.setIsShowId(checked)
  }

  return <Switch defaultChecked={isChecked} onCheckedChange={handleCheck} />
}
