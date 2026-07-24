import { observer } from 'mobx-react-lite'
import { FC } from 'react'

interface Props {
  label: string
  count?: number
}

export const LabelCounter: FC<Props> = observer(({ label, count }) => {
  return (
    <p className={'body-12'}>
      {label} {count && count > 0 && `(${count})`}
    </p>
  )
})
