import React, { FC, useRef } from 'react'
import { TextEditorMode } from '@/widgets/MantineTextEditor/MantineTextEditor'
import { EditorButton } from '@/widgets/MantineTextEditor/ui/EditorButton/EditorButton'
import { Paperclip } from '@/shared/assets/images/icons/textEditorIcons'

interface Props {
  onChange?: (file: FileList | null) => Promise<void> | void
  mode: TextEditorMode
}

export const FileUploadButton: FC<Props> = ({ onChange, mode }) => {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  return (
    <div>
      <input
        type='file'
        accept='*'
        multiple
        ref={fileInputRef}
        onChange={(e) => onChange?.(e.target.files)}
        style={{ display: 'none' }}
      />
      <EditorButton
        action={handleButtonClick}
        Icon={Paperclip}
        command={'Upload file'}
        mode={mode}
      />
    </div>
  )
}
