import { Editor } from '@tiptap/react'
import classNames from 'classnames'
import React, { FC, useCallback, useEffect, useState } from 'react'
import { Link, ShareLink } from '@/shared/assets/images/icons/textEditorIcons'
import { Button } from '@/shared/ui/Button/Button'
import { Input } from '@/shared/ui/Input/Input'
import { Popover } from '@/shared/ui/Popover/Popover'

interface Props {
  editor: Editor
}

export const CustomLinkExtension: FC<Props> = ({ editor }) => {
  const [open, setOpen] = useState(false)
  const [linkValue, setLinkValue] = useState('')
  const [openInNewTab, setOpenInNewTab] = useState(false)

  const handleSetLink = useCallback(() => {
    if (!linkValue.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
    } else {
      try {
        editor
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({
            href: linkValue.trim(),
            target: openInNewTab ? '_blank' : 'undefined',
            rel: openInNewTab ? 'noopener noreferrer' : 'undefined'
          })
          .run()
      } catch (e) {
        alert((e as Error).message)
      }
    }
    setOpen(false)
  }, [editor, linkValue, openInNewTab])

  const handleOpen = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href || ''
    setLinkValue(previousUrl)
    setOpen(true)
  }, [])

  const isLinkActive = editor.isActive('link')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform)
      const isShortcut = (isMac && e.metaKey) || (!isMac && e.ctrlKey)

      if (isShortcut && e.key.toLowerCase() === 'k') {
        if (editor && editor.isFocused) {
          e.preventDefault()

          if (editor.isActive('link')) {
            editor.chain().focus().extendMarkRange('link').unsetLink().run()
            setOpen(false)
          } else {
            handleOpen()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [editor, handleOpen])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Popover.Trigger
        className={classNames(
          'py-2 px-2 flex gap-1 body-12 bg-hover hover:bg-hover',
          isLinkActive && '!bg-accent'
        )}
        onClick={handleOpen}
      >
        <Link className={isLinkActive ? undefined : 'icon'} />
      </Popover.Trigger>
      <Popover.Content
        onFocusOutside={(event) => event.preventDefault()}
        className={'flex gap-2 items-center'}
      >
        <Input
          placeholder={'https://example.com/'}
          value={linkValue}
          onChange={(e) => setLinkValue(e.target.value)}
        />
        <Button
          styleButton={openInNewTab ? 'filled' : 'outline'}
          colorButton={openInNewTab ? 'accent' : 'dark'}
          className={classNames(
            'p-2',
            !openInNewTab ? '!border-accent box-border' : undefined
          )}
          onClick={() => setOpenInNewTab((prev) => !prev)}
        >
          <ShareLink className={'icon'} />
        </Button>
        <Button
          styleButton={'outline'}
          colorButton={'dark'}
          className={'!border-accent p-2'}
          onClick={handleSetLink}
        >
          Сохранить
        </Button>
      </Popover.Content>
    </Popover>
  )
}
