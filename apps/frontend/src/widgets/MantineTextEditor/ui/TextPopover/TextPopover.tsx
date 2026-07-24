import { Editor } from '@tiptap/core'
import classNames from 'classnames'
import React, { FC, SVGProps, useState } from 'react'
import { TextEditorMode } from '@/widgets/MantineTextEditor/MantineTextEditor'
import { EditorButton } from '@/widgets/MantineTextEditor/ui/EditorButton/EditorButton'
import { CaretDown, CaretUp } from '@/shared/assets/images/icons'
import {
  CodeBlock,
  Highlighter,
  Subscript,
  Superscript,
  Text
} from '@/shared/assets/images/icons/textEditorIcons'
import { Popover } from '@/shared/ui/Popover/Popover'


interface Props {
  editor: Editor
  mode: TextEditorMode
}

type EditorCommand =
  | 'toggleHighlight'
  | 'toggleSubscript'
  | 'toggleSuperscript'
  | 'toggleCodeBlock'

interface ITextOptions {
  name: string
  icon: FC<SVGProps<SVGSVGElement>>
  label: string
  command: EditorCommand
  shortcut: string
}

const textOptions: ITextOptions[] = [
  {
    name: 'highlight',
    icon: Highlighter,
    label: 'Выделитель',
    command: 'toggleHighlight',
    shortcut: 'Ctrl+Shift+H'
  },
  {
    name: 'subscript',
    icon: Subscript,
    label: 'Нижний индекс',
    command: 'toggleSubscript',
    shortcut: 'Ctrl+,'
  },
  {
    name: 'superscript',
    icon: Superscript,
    label: 'Верхний индекс',
    command: 'toggleSuperscript',
    shortcut: 'Ctrl+.'
  },
  {
    name: 'codeBlock',
    icon: CodeBlock,
    label: 'Кодовый блок',
    command: 'toggleCodeBlock',
    shortcut: 'Ctrl+E'
  }
]

export const TextPopover: FC<Props> = ({ editor, mode }) => {
  const [open, setOpen] = useState(false)

  const isAnyOptionActive = textOptions.some((option) =>
    editor.isActive(option.name)
  )

  const executeCommand = (command: EditorCommand) => {
    editor.chain().focus()[command]().run()
  }

  const target = document.querySelector(
    '.radix-dialog-task-creation'
  ) as HTMLElement

  const iconClassName = classNames(
    'w-4 h-4',
    isAnyOptionActive ? undefined : 'icon'
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={classNames(
          isAnyOptionActive && '!bg-accent',
          'py-2 px-2 flex gap-1 body-12 bg-hover hover:bg-hover'
        )}
      >
        <Text className={iconClassName} />
        {open ? (
          <CaretUp className={iconClassName} />
        ) : (
          <CaretDown className={iconClassName} />
        )}
      </Popover.Trigger>
      <Popover.Content
        onFocusOutside={(event) => event.preventDefault()}
        className={'flex flex-col gap-1 items-start'}
        container={target}
      >
        {textOptions.map((option) => (
          <EditorButton
            key={option.name}
            action={() => executeCommand(option.command)}
            isActive={editor.isActive(option.name)}
            Icon={option.icon}
            command={option.label}
            label={option.label}
            className={'w-[250px]'}
            shortcut={option.shortcut}
            mode={mode}
          />
        ))}
      </Popover.Content>
    </Popover>
  )
}
