import React from 'react'
import { Input } from '@/shared/ui/Input/Input'

export const Place = () => {
  return (
    <div className={'flex border-b border-objects gap-6 py-6 disabled-30'}>
      <div className={'flex flex-col gap-2 w-[480px]'}>
        <h4>Местоположение</h4>
        <p className={'secondaryText body-14-16'}>Где вы сейчас находитесь</p>
      </div>
      <div className={'w-[564px] flex flex-col gap-2'}>
        <Input
          placeholder={'Укажите местоположение'}
          className={'pointer-events-none'}
        />
      </div>
    </div>
  )
}
