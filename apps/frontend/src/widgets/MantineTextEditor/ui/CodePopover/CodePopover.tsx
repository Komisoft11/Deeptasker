import { Editor } from '@tiptap/core'
import classNames from 'classnames'
import React, { FC, useState } from 'react'
import { TextEditorMode } from '@/widgets/MantineTextEditor/MantineTextEditor'
import {
  CodeLanguage,
  codeLanguages
} from '@/widgets/MantineTextEditor/ui/CodePopover/const/codeLanguages'
import { EditorButton } from '@/widgets/MantineTextEditor/ui/EditorButton/EditorButton'
import { CaretDown, CaretUp } from '@/shared/assets/images/icons'
import { CodeBlock } from '@/shared/assets/images/icons/textEditorIcons'
import { Popover } from '@/shared/ui/Popover/Popover'


interface Props {
  editor: Editor
  mode: TextEditorMode
}

export const CodePopover: FC<Props> = ({ editor, mode }) => {
  const [open, setOpen] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState(
    CodeLanguage.PlainText
  )

  const handleLanguageChange = (language: CodeLanguage) => {
    setSelectedLanguage(language)
    editor.chain().focus().setCodeBlock({ language }).run()
    setOpen(false)
  }

  return (
    <>
      <EditorButton
        action={() => editor.chain().focus().toggleCodeBlock().run()}
        isActive={editor.isActive('codeBlock')}
        Icon={CodeBlock}
        command='Code block'
        mode={mode}
      />
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger
          className='py-2 px-2 flex gap-1 body-12 hover:bg-hover'
          onPointerDown={(e) => e.preventDefault()}
        >
          {selectedLanguage ? selectedLanguage : 'Выберите язык'}
          {open ? (
            <CaretUp className='w-4 h-4' />
          ) : (
            <CaretDown className='w-4 h-4' />
          )}
        </Popover.Trigger>

        <Popover.Content className={'w-[150px]'}>
          {codeLanguages.map(({ name, label }) => (
            <EditorButton
              key={name}
              action={() => handleLanguageChange(name)}
              isActive={selectedLanguage === name}
              label={label}
              command={name}
              mode={mode}
              className={classNames(
                'w-full',
                selectedLanguage != name ? 'hover:bg-hover' : undefined
              )}
            />
          ))}
        </Popover.Content>
      </Popover>
    </>
  )
}
