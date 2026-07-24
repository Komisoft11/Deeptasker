import { Editor } from '@tiptap/core'
import { BubbleMenu } from '@tiptap/react'
import React, { FC } from 'react'
import { TextEditorMode } from '@/widgets/MantineTextEditor/MantineTextEditor'
import { HeadingPopover, TextStyleButtons } from '@/widgets/MantineTextEditor/ui'

interface Props {
  editor: Editor
  mode: TextEditorMode
  isActive?: boolean
}

export const BubbleMenuContent: FC<Props> = ({ editor, mode }) => {
  return (
    <BubbleMenu
      editor={editor}
      className={'p-2 rounded-lg bg-objects flex'}
      tippyOptions={{
        placement: 'bottom',
        offset: [0, 12],
        appendTo: 'parent'
      }}
      shouldShow={({ editor, state, from, to }) => {
        const { doc } = state

        let hasImage = false
        doc.nodesBetween(from, to, (node) => {
          if (node.type.name === 'image') {
            hasImage = true
          }
        })

        if (hasImage || editor.isActive('image') || editor.isActive('link')) {
          return false
        }

        return from !== to
      }}
    >
      <HeadingPopover editor={editor} mode={mode} />
      <TextStyleButtons editor={editor} mode={mode} />
    </BubbleMenu>
  )
}