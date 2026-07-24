import classNames from 'classnames'
import { FC } from 'react'
import { StrengthIndicator } from '@/features/PasswordInput'

interface Props {
  strength: StrengthIndicator
}

export const StrengthBar: FC<Props> = ({ strength = 'default' }) => {
  const strengthClasses = {
    low: ['bg-systemRed', 'bg-hover', 'bg-hover'],
    medium: ['bg-systemYellow', 'bg-systemYellow', 'bg-hover'],
    high: ['bg-systemGreen', 'bg-systemGreen', 'bg-systemGreen'],
    default: ['bg-hover', 'bg-hover', 'bg-hover']
  }
  const barClasses = strengthClasses[strength] || strengthClasses.default

  return (
    <div className='flex gap-1 w-full'>
      {barClasses.map((barClass, index) => (
        <div
          key={index}
          className={classNames('w-1/3 h-[6px] rounded-lg', barClass)}
        />
      ))}
    </div>
  )
}
