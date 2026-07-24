import { Editor } from '@tiptap/core'
import { Level } from '@tiptap/extension-heading'
import React, { FC, useState } from 'react'
import { TextEditorMode } from '@/widgets/MantineTextEditor/MantineTextEditor'
import { EditorButton } from '@/widgets/MantineTextEditor/ui/EditorButton/EditorButton'
import { CaretDown, CaretUp } from '@/shared/assets/images/icons'
import {
  H1,
  H2,
  H3,
  H4,
  Paragraph
} from '@/shared/assets/images/icons/textEditorIcons'
import { Popover } from '@/shared/ui/Popover/Popover'


interface Props {
  editor: Editor
  mode: TextEditorMode
}

const headingFontSizeMap: Record<Level, string> = {
  1: '32',
  2: '24',
  3: '16',
  4: '14',
  5: '12',
  6: '10'
}

export const HeadingPopover: FC<Props> = ({ editor, mode }) => {
  const [open, setOpen] = useState(false)
  const headingLevels: Level[] = [1, 2, 3, 4]

  const getActiveHeading = () => {
    for (const level of headingLevels) {
      if (editor.isActive('heading', { level })) {
        return {
          label: `Заголовок ${level}`,
          icon: level === 1 ? H1 : level === 2 ? H2 : level === 3 ? H3 : H4
        }
      }
    }
    if (editor.isActive('paragraph')) {
      return {
        label: 'Параграф',
        icon: Paragraph
      }
    }
    return {
      label: 'Заголовок',
      icon: H1
    }
  }

  const handleToggle = (level: Level | 'paragraph') => {
    if (!editor) return

    let fontSize = '14px'

    if (level !== 'paragraph') {
      fontSize = headingFontSizeMap[level] || '14px'
    }

    if (level === 'paragraph') {
      editor
        .chain()
        .focus()
        .setParagraph()
        .setMark('textStyle', { fontSize: fontSize })
        .run()
    } else {
      editor
        .chain()
        .focus()
        .toggleHeading({ level })
        .setMark('textStyle', { fontSize: fontSize })
        .run()
    }

    setOpen(false)
  }

  const { label, icon: ActiveIcon } = getActiveHeading()

  const target = document.querySelector(
    '.radix-dialog-task-creation'
  ) as HTMLElement

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={
          'py-2 px-2 flex justify-between gap-1 body-12 hover:bg-hover w-[130px]'
        }
      >
        <div className={'flex gap-1'}>
          <ActiveIcon className={'w-4 h-4 icon'} />
          {label}
        </div>

        {open ? (
          <CaretUp className={'w-4 h-4 icon'} />
        ) : (
          <CaretDown className={'w-4 h-4 icon'} />
        )}
      </Popover.Trigger>
      <Popover.Content
        onFocusOutside={(event) => event.preventDefault()}
        container={target}
      >
        <EditorButton
          action={() => handleToggle('paragraph')}
          isActive={editor.isActive('paragraph')}
          Icon={Paragraph}
          label={'Параграф'}
          command={'Paragraph'}
          className={'w-[250px]'}
          shortcut={'Ctrl+Alt+0'}
          mode={mode}
        />
        {headingLevels.map((level) => (
          <EditorButton
            key={level}
            action={() => handleToggle(level)}
            isActive={editor.isActive('heading', { level })}
            Icon={level === 1 ? H1 : level === 2 ? H2 : level === 3 ? H3 : H4}
            label={`Заголовок ${level}`}
            command={`H${level}`}
            className={'w-[250px]'}
            shortcut={`Ctrl+Alt+${level}`}
            mode={mode}
          />
        ))}
      </Popover.Content>
    </Popover>
  )
}
