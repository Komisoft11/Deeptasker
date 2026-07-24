import { Editor } from '@tiptap/core'
import classNames from 'classnames'
import React, { FC } from 'react'
import { TextEditorMode } from '@/widgets/MantineTextEditor/MantineTextEditor'
import styles from '@/widgets/MantineTextEditor/MantineTextEditor.module.scss'
import {
  AlignPopover,
  CodePopover,
  CustomLinkExtension,
  EditorButton,
  FileUploadButton,
  FontSizeControl,
  HeadingPopover,
  TextPopover,
  TextStyleButtons
} from '@/widgets/MantineTextEditor/ui'
import { ButtonGroup } from '@/widgets/MantineTextEditor/ui/ButtonGroup/ButtonGroup'
import {
  Image,
  ListBullets,
  ListNumbers,
  Redo,
  Undo
} from '@/shared/assets/images/icons/textEditorIcons'

interface EditorToolbarProps {
  editor: Editor
  fontSize: string
  onIncrement: () => void
  onDecrement: () => void
  onFontSizeChange: (size: string) => void
  onAddImage: () => void
  onFileChange?: (file: FileList | null) => Promise<void> | void
  mode: TextEditorMode
}

export const EditorToolbar: FC<EditorToolbarProps> = ({
  editor,
  fontSize,
  onIncrement,
  onDecrement,
  onFontSizeChange,
  onAddImage,
  onFileChange,
  mode
}) => {
  if (!editor) return null

  const isCodeBlockActive = editor.isActive('codeBlock')

  return (
    <div
      id={'tools'}
      className={classNames(
        styles.tools,
        'sticky top-[-16px]',
        mode === 'modal' && 'border-hover bg-objects'
      )}
    >
      {!isCodeBlockActive ? (
        <>
          <ButtonGroup mode={mode}>
            <EditorButton
              action={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              Icon={Undo}
              command='undo'
              tooltipContent={'Отменить действие'}
              shortcut={'Ctrl+Z'}
              mode={mode}
            />
            <EditorButton
              action={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              Icon={Redo}
              command='redo'
              tooltipContent={'Вернуть действие'}
              shortcut={'Ctrl+Shift+Z'}
              mode={mode}
            />
          </ButtonGroup>
          <ButtonGroup mode={mode}>
            <HeadingPopover editor={editor} mode={mode} />
          </ButtonGroup>
          {mode === 'default' && (
            <ButtonGroup mode={mode}>
              <FontSizeControl
                fontSize={fontSize}
                onIncrement={onIncrement}
                onDecrement={onDecrement}
                onChange={(e) => onFontSizeChange(e.target.value)}
              />
            </ButtonGroup>
          )}

          <TextStyleButtons editor={editor} mode={mode} />

          <AlignPopover editor={editor} mode={mode} />
          <TextPopover editor={editor} mode={mode} />

          <EditorButton
            action={() => editor.chain().focus().toggleBulletList().run()}
            isActive={editor.isActive('bulletList')}
            Icon={ListBullets}
            command='BulletList'
            tooltipContent={'Ненумерованный список'}
            shortcut={'Ctrl+Shift+8'}
            mode={mode}
          />
          <EditorButton
            action={() => editor.chain().focus().toggleOrderedList().run()}
            isActive={editor.isActive('orderedList')}
            Icon={ListNumbers}
            command='OrderedList'
            tooltipContent={'Нумерованный список'}
            shortcut={'Ctrl+Shift+7'}
            mode={mode}
          />
          <EditorButton
            action={onAddImage}
            isActive={editor.isActive('image')}
            Icon={Image}
            command='Set image'
            mode={mode}
          />

          <FileUploadButton onChange={onFileChange} mode={mode} />
          <CustomLinkExtension editor={editor} />
        </>
      ) : (
        <ButtonGroup mode={mode}>
          <CodePopover editor={editor} mode={mode} />
        </ButtonGroup>
      )}
    </div>
  )
}
