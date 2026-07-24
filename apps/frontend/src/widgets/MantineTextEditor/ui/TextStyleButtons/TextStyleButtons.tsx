import { Editor } from '@tiptap/core'
import { FC } from 'react'
import { TextEditorMode } from '@/widgets/MantineTextEditor/MantineTextEditor'
import { ButtonGroup, EditorButton } from '@/widgets/MantineTextEditor/ui'
import {
  Bold,
  CodeBlock,
  Italic,
  Strikethrough,
  UnderlineIcon
} from '@/shared/assets/images/icons/textEditorIcons'

interface Props {
  editor: Editor
  mode: TextEditorMode
}

export const TextStyleButtons: FC<Props> = ({ editor, mode }) => {
  const buttons = [
    {
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      Icon: Bold,
      command: 'Bold',
      tooltipContent: 'Жирный шрифт',
      shortcut: 'Ctrl+B',
      disabled: editor.isActive('code')
    },
    {
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      Icon: Italic,
      command: 'Italic',
      tooltipContent: 'Курсив',
      shortcut: 'Ctrl+I',
      disabled: editor.isActive('code')
    },
    {
      action: () => editor.chain().focus().toggleUnderline().run(),
      isActive: editor.isActive('underline'),
      Icon: UnderlineIcon,
      command: 'Underline',
      tooltipContent: 'Подчеркивание',
      shortcut: 'Ctrl+U',
      disabled: editor.isActive('code')
    },
    {
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive('strike'),
      Icon: Strikethrough,
      command: 'Strikethrough',
      tooltipContent: 'Перечёркнутый текст',
      shortcut: 'Ctrl+Shift+S',
      disabled: editor.isActive('code')
    },
    {
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive('code'),
      Icon: CodeBlock,
      command: 'Code',
      tooltipContent: 'Код',
      shortcut: 'Ctrl+E',
      disabled: false
    }
  ]

  return (
    <ButtonGroup mode={mode}>
      {buttons.map((button, index) => (
        <EditorButton
          key={index}
          action={button.action}
          isActive={button.isActive}
          Icon={button.Icon}
          command={button.command}
          tooltipContent={button.tooltipContent}
          shortcut={button.shortcut}
          disabled={button.disabled}
          mode={mode}
        />
      ))}
    </ButtonGroup>
  )
}
