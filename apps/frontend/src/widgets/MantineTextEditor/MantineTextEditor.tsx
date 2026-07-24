import '@mantine/tiptap/styles.css'
import { Placeholder } from '@tiptap/extensions'
import { EditorContent, useEditor } from '@tiptap/react'
import classNames from 'classnames'
import { debounce } from 'lodash'
import { observer } from 'mobx-react-lite'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { EditorToolbar } from '@/widgets/MantineTextEditor/ui'
import { extensions } from '@/widgets/MantineTextEditor/utils/editorConfig'
import { ReplyData } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/TaskCommentTab'
import { formatDateTime } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/helper/formatDateTime'
import { Close, Draft, Edit } from '@/shared/assets/images/icons'
import {
  CTRL,
  E,
  ENTER,
  ESCAPE,
  E_KEY,
  SHIFT
} from '@/shared/const/keyboardKeys'
import { PLACEHOLDERS, TRANSLATION } from '@/shared/const/translation'
import { SessionStorageHelper } from '@/shared/lib/helpers/session-storage.helper'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Button } from '@/shared/ui/Button/Button'
import { KbdElement } from '@/shared/ui/KbdElement/KbdElement'
import styles from './MantineTextEditor.module.scss'

export type TextEditorMode = 'default' | 'modal' | 'readonly'

interface Props {
  initialContent: string
  onContentChange: (content: string) => void
  handleSave?: () => void
  handleCancel?: () => void
  replyData?: ReplyData | null
  className?: string
  onFileChange?: (file: FileList | null) => Promise<void> | void
  mode?: TextEditorMode
  contentClassName?: string
  withDraft?: boolean
  isComment?: boolean
  wrapperClassName?: string
  containerClassName?: string
  canEdit?: boolean
}

export const MantineTextEditor: FC<Props> = observer(
  ({
    initialContent,
    onContentChange,
    handleSave,
    handleCancel,
    replyData,
    className,
    onFileChange,
    mode = 'default',
    contentClassName,
    withDraft = false,
    isComment = false,
    wrapperClassName,
    containerClassName
  }) => {
    const { t, ready } = useTranslation([TRANSLATION, PLACEHOLDERS])
    const [content, setContent] = useState(initialContent)
    const [isEdit, setIsEdit] = useState(mode === 'modal')
    const [fontSize, setFontSize] = useState('16')
    const { taskStore } = useRootStore()

    const activeTask = mode === 'default' ? taskStore.activeTask : undefined

    const placeholderText = isComment
      ? t('enterCommentText', { ns: PLACEHOLDERS })
      : t('enterTaskDescription', { ns: PLACEHOLDERS })

    const debouncedSaveDraft = useMemo(
      () => debounce((value: string) => handleSaveDraft(value), 500),
      []
    )

    useEffect(() => {
      return () => {
        debouncedSaveDraft.cancel()
      }
    }, [debouncedSaveDraft])

    const editor = useEditor({
      extensions: [
        ...extensions,
        Placeholder.configure({
          placeholder: placeholderText
        })
      ],
      content,
      editable: mode !== 'readonly',
      onUpdate({ editor }) {
        const updatedContent = editor.getHTML()
        setContent(updatedContent)
        onContentChange(updatedContent)

        const isSavingDraft =
          editor.getText().length > 0 && updatedContent !== initialContent

        if (isSavingDraft) {
          debouncedSaveDraft(updatedContent)
        }
      },
      editorProps: {
        attributes: {
          class: 'h-full'
        },
        handlePaste(view, event) {
          const items = event.clipboardData?.items
          if (!items) return false

          for (const item of items) {
            if (item.type.indexOf('image') === 0) {
              const file = item.getAsFile()
              if (file) {
                const reader = new FileReader()
                reader.onload = (readerEvent) => {
                  const base64 = readerEvent.target?.result as string
                  view.dispatch(
                    view.state.tr.replaceSelectionWith(
                      view.state.schema.nodes.image.create({ src: base64 })
                    )
                  )
                }
                reader.readAsDataURL(file)
                return true
              }
            }
          }

          return false
        }
      }
    })

    useEffect(() => {
      if (editor && ready) {
        const placeholderExtension = editor.extensionManager.extensions.find(
          (ext) => ext.name === 'placeholder'
        )

        if (placeholderExtension) {
          placeholderExtension.options.placeholder = placeholderText
          if (editor?.view && !editor.isDestroyed) {
            editor.view.updateState(editor.state)
          }
        }
      }
    }, [editor, ready, placeholderText])

    if (!editor) {
      return null
    }

    const applyFontSize = (size: string) => {
      if (!editor) return

      editor
        .chain()
        .focus()
        .setMark('textStyle', { fontSize: `${size}px` })
        .run()

      setFontSize(size)
    }

    const handleIncrement = () => {
      if (parseInt(fontSize) < 50) {
        applyFontSize((parseInt(fontSize) + 2).toString())
      }
    }

    const handleDecrement = () => {
      if (parseInt(fontSize) > 10) {
        applyFontSize((parseInt(fontSize) - 2).toString())
      }
    }

    const hasDraft =
      !!activeTask?.id && SessionStorageHelper.hasDraft(activeTask.id)

    const isInitial =
      !!activeTask?.id &&
      SessionStorageHelper.getEditorDraft(activeTask.id) === initialContent

    const [isShowDraft, setIsShowDraft] = useState<boolean>(
      withDraft && hasDraft && !isInitial
    )

    useEffect(() => {
      const handleUpdate = () => {
        const currentFontSize = editor.getAttributes('textStyle').fontSize
        if (currentFontSize) {
          setFontSize(currentFontSize.replace('px', ''))
        }
      }

      editor.on('selectionUpdate', handleUpdate)
      editor.on('transaction', handleUpdate)

      return () => {
        editor.off('selectionUpdate', handleUpdate)
        editor.off('transaction', handleUpdate)
      }
    }, [editor])

    useEffect(() => {
      if (mode === 'modal' && editor) {
        editor.commands.focus()
      }
    }, [mode, editor])

    const addImage = () => {
      if (!editor) return

      const url = window.prompt('URL')
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    }

    const handleEditorClick = () => {
      setIsEdit(true)
      editor.commands.focus()
    }

    const handleRestoreDraft = () => {
      if (activeTask) {
        const draft = SessionStorageHelper.getEditorDraft(activeTask.id)
        if (draft) {
          editor.commands.focus()
          editor.commands.setContent(draft)
          setContent(draft)
          onContentChange(draft)
        }
      }
      setIsShowDraft(false)
    }

    const handleDeleteDraft = () => {
      if (activeTask) {
        SessionStorageHelper.clearDraft(activeTask.id)
      }
      setIsShowDraft(false)
    }

    const handleSaveDraft = (draft: string) => {
      if (activeTask) {
        SessionStorageHelper.setEditorDraft(activeTask.id, draft)
      }
    }

    const handleCancelClick = (e?: React.MouseEvent) => {
      e?.stopPropagation()
      handleCancel?.()
      setIsEdit(false)
      editor.commands.setContent(initialContent ?? '')
      setContent(initialContent)

      if (withDraft && hasDraft) {
        handleDeleteDraft()
      }
    }

    const handleSaveClick = (e?: React.MouseEvent) => {
      e?.stopPropagation()
      setIsEdit(false)
      handleSave?.()
      if (withDraft && hasDraft) {
        handleDeleteDraft()
      }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (mode === 'default' && e.key === ENTER && e.ctrlKey) {
        handleSaveClick()
      }

      if (e.key === ESCAPE) {
        handleCancelClick()
      }
    }

    const isVisible =
      (mode !== 'readonly' && (isComment || isEdit)) || mode === 'modal'

    const isShowButtons =
      mode !== 'readonly' && (isComment || (isEdit && mode === 'default'))

    const isCanEdit =
      !isComment && !isEdit && mode !== 'modal' && mode !== 'readonly'

    useEffect(() => {
      if (editor) {
        editor.setEditable(mode !== 'readonly' && (isComment || isEdit))
      }
    }, [editor, mode, isEdit, isComment])

    useEffect(() => {
      if (!editor) return

      const current = editor.getHTML()

      if (current !== initialContent) {
        editor.commands.setContent(initialContent ?? '', false)
      }
    }, [initialContent, editor])

    useEffect(() => {
      const handler = (e: KeyboardEvent) => {
        if (mode === 'default' && e.code === E_KEY && e.ctrlKey && e.shiftKey) {
          setIsEdit(true)
          editor?.commands.focus()
        }
      }

      window.addEventListener('keydown', handler, { capture: true })

      return () => {
        window.removeEventListener('keydown', handler, { capture: true })
      }
    }, [mode, editor])

    return (
      <div className={classNames('flex flex-col h-full', wrapperClassName)}>
        <div
          className={classNames(
            styles.container,
            containerClassName,
            mode === 'modal' && 'border-hover h-full'
          )}
          id={'textEditor'}
        >
          {isCanEdit && (
            <div
              className={classNames(
                'flex items-center justify-between p-3 border-b border-border gap-2 rounded-lg hover:cursor-pointer h-[57px] hover:bg-hover',
                'sticky top-[-16px] bg-bg z-1'
              )}
              onClick={handleEditorClick}
            >
              <div className={'flex gap-2'}>
                <Edit className={'w-4 h-4 iconSecondary'} />
                <p className={'secondaryText body-14-16'}>
                  {t('edit', { ns: TRANSLATION })}
                </p>
              </div>

              <KbdElement
                className={'px-2'}
                kdb={`${CTRL}+${SHIFT}+${E}`}
                tooltipContent={t('edit', { ns: TRANSLATION })}
              />
            </div>
          )}
          {isVisible && (
            <EditorToolbar
              editor={editor}
              fontSize={fontSize}
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
              onFontSizeChange={applyFontSize}
              onAddImage={addImage}
              onFileChange={onFileChange}
              mode={mode}
            />
          )}

          <div
            className={classNames(
              styles.content,
              contentClassName,
              'overflow-y-auto scrollbarContainerOnBg'
            )}
          >
            {replyData && (
              <div
                className={
                  'body-14-16 flex flex-col gap-2 pl-3 border-l border-l-border mb-4'
                }
              >
                <p>
                  {replyData.user.firstName} {replyData.user.lastName}{' '}
                  {formatDateTime({ date: replyData.dateCreated })}
                </p>
                <div
                  className={'secondaryText whitespace-pre-wrap'}
                  dangerouslySetInnerHTML={{ __html: replyData.content }}
                />
              </div>
            )}
            <EditorContent
              editor={editor}
              onKeyDown={handleKeyDown}
              tabIndex={0}
              className={classNames('min-h-[70px] max-h-[150px] ', className)}
            />
          </div>
        </div>
        {isShowButtons && (
          <div className={'flex w-full justify-between pt-3'}>
            {isShowDraft && (
              <div className={'flex p-1 rounded bg-hover w-max items-center'}>
                <div className={'p-1'}>
                  <Draft className={'w-5 h-5 icon'} />
                </div>
                <p className={'px-1 body-14-20'}>
                  {t('hasDraft', { ns: TRANSLATION })}
                </p>
                <div className={'flex gap-1 pl-1'}>
                  <Button
                    styleButton={'filled'}
                    className={'body-14-16 p-2'}
                    colorButton={'dark'}
                    onClick={handleRestoreDraft}
                  >
                    {t('restore', { ns: TRANSLATION })}
                  </Button>
                  <Button
                    styleButton={'filled'}
                    colorButton={'dark'}
                    className={'p-2'}
                    onClick={handleDeleteDraft}
                  >
                    <Close className={'w-4 h-4 icon'} />
                  </Button>
                </div>
              </div>
            )}
            <div className={'ml-auto flex gap-2'}>
              <Button
                styleButton={'outline'}
                className={'w-[120px] body-14-16 h-10'}
                onClick={handleCancelClick}
              >
                {t('cancel', { ns: TRANSLATION })}
              </Button>

              <Button
                styleButton={'filled'}
                className={'w-[120px] body-14-16 h-10'}
                onClick={handleSaveClick}
              >
                {t('save', { ns: TRANSLATION })}
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }
)
