import { ComponentPreview, Previews } from '@react-buddy/ide-toolbox'
import React from 'react'
import App from '@/app/App'
import { VerificationForm } from '@/features/User'
import { Input } from '@/shared/ui/Input/Input'
import { PaletteTree } from './palette'


const ComponentPreviews = () => {
  return (
    <Previews palette={<PaletteTree />}>
      <ComponentPreview path='/App'>
        <App />
      </ComponentPreview>
      <ComponentPreview path='/Input'>
        <Input />
      </ComponentPreview>
      <ComponentPreview path='/VerificationForm'>
        <VerificationForm
          candidateEmail={''}
          onResend={async () => {}}
          onVerify={async () => {}}
        />
      </ComponentPreview>
    </Previews>
  )
}

export default ComponentPreviews
