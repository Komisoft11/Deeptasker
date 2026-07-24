import '@mantine/tiptap/styles.css'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'

export const TestPage = observer(({}) => {
  const [date, setDate] = useState<string | null>(null)

  return (
    <div className={'w-full h-full flex items-center justify-center'}></div>
  )
})
