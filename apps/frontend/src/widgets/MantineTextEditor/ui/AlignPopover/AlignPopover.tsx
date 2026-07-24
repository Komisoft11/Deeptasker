import { Editor } from '@tiptap/core'
import React, { FC, useState } from 'react'
import { TextEditorMode } from '@/widgets/MantineTextEditor/MantineTextEditor'
import { EditorButton } from '@/widgets/MantineTextEditor/ui/EditorButton/EditorButton'
import { CaretDown, CaretUp } from '@/shared/assets/images/icons'
import {
  Center,
  Justify,
  Left,
  Right
} from '@/shared/assets/images/icons/textEditorIcons'
import { Popover } from '@/shared/ui/Popover/Popover'

interface Props {
  editor: Editor
  mode: TextEditorMode
}

const alignOptions = [
  { name: 'left', icon: Left, label: 'Слева', shortcut: 'Ctrl+Shift+L' },
  {
    name: 'center',
    icon: Center,
    label: 'По центру',
    shortcut: 'Ctrl+Shift+E'
  },
  { name: 'right', icon: Right, label: 'Справа', shortcut: 'Ctrl+Shift+R' },
  {
    name: 'justify',
    icon: Justify,
    label: 'По ширине',
    shortcut: 'Ctrl+Shift+J'
  }
]

export const AlignPopover: FC<Props> = ({ editor, mode }) => {
  const [open, setOpen] = useState(false)

  const getActiveAlignment = () => {
    const activeOption = alignOptions.find(({ name }) =>
      editor.isActive({ textAlign: name })
    )
    return activeOption || alignOptions[0]
  }

  const handleToggle = (align: string) => {
    editor.chain().focus().setTextAlign(align).run()
    setOpen(false)
  }

  const target = document.querySelector(
    '.radix-dialog-task-creation'
  ) as HTMLElement

  const activeAlignment = getActiveAlignment()
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={'py-2 px-2 flex gap-1 body-12  bg-hover hover:bg-hover'}
      >
        <activeAlignment.icon className='w-4 h-4 icon' />
        {open ? (
          <CaretUp className={'w-4 h-4 icon'} />
        ) : (
          <CaretDown className={'w-4 h-4 icon'} />
        )}
      </Popover.Trigger>
      <Popover.Content
        onFocusOutside={(event) => event.preventDefault()}
        container={target}
        className={'flex flex-col gap-1'}
      >
        {alignOptions.map(({ name, icon: Icon, label, shortcut }) => (
          <EditorButton
            key={name}
            action={() => handleToggle(name)}
            isActive={editor.isActive({ textAlign: name })}
            Icon={Icon}
            label={label}
            command={`${name}`}
            shortcut={shortcut}
            className={'w-full'}
            mode={mode}
          />
        ))}
      </Popover.Content>
    </Popover>
  )
}
