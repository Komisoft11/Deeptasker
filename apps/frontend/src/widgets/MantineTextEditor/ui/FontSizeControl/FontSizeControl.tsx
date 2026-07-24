import { observer } from 'mobx-react-lite'
import React, { FC } from 'react'
import { Minus, Plus } from '@/shared/assets/images/icons/textEditorIcons'
import { Input } from '@/shared/ui/Input/Input'
import styles from './FontSizeControl.module.scss'

interface FontSizeControlProps {
  fontSize: string
  onIncrement: () => void
  onDecrement: () => void
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export const FontSizeControl: FC<FontSizeControlProps> = observer(
  ({ fontSize, onIncrement, onDecrement, onChange }) => {
    return (
      <div className='flex gap-1 items-center'>
        <button onClick={onDecrement} className={styles.button}>
          <Minus className={'icon w-4 h-4'} />
        </button>
        <Input
          value={fontSize}
          onChange={onChange}
          style={{ width: '50px', textAlign: 'center' }}
          className={styles.input}
          inputClassName={'body-12'}
        />
        <button onClick={onIncrement} className={styles.button}>
          <Plus className={'icon w-4 h-4'} />
        </button>
      </div>
    )
  }
)
