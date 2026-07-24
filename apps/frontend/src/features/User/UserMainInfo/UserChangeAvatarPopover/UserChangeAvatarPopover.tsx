import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { FC, useRef, useState } from 'react'
import AvatarEditor from 'react-avatar-editor'
import { UserAvatar } from '@/features/User'
import styles from '@/features/User/MemberPermissionSettings/MemberPermissionSettings.module.scss'
import { IUser, useUsers } from '@/entities/User'
import { Edit, Trash, Wheel } from '@/shared/assets/images/icons'
import useDialogAndPopover from '@/shared/lib/hooks/useDialogAndPopover'
import { Button } from '@/shared/ui/Button/Button'
import { Dialog } from '@/shared/ui/Dialog/Dialog'
import { Popover } from '@/shared/ui/Popover/Popover'


interface Props {
  user: IUser
  isSmall: boolean
}

export const UserChangeAvatarPopover: FC<Props> = observer(
  ({ user, isSmall }) => {
    const { updateAvatar, deleteAvatar } = useUsers()
    const { open, onOpenChange } = useDialogAndPopover()

    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const inputId = `avatar-${user.id}`

    const editorRef = useRef<AvatarEditor | null>(null)

    const [rotate, setRotate] = useState(0)
    const [scale, setScale] = useState(1)

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) {
        setPreviewUrl(URL.createObjectURL(file))
        onOpenChange(true)
      }
    }

    const handleUploadAvatar = async () => {
      if (!editorRef.current) return

      const canvas = editorRef.current.getImageScaledToCanvas()
      canvas.toBlob(async (file: Blob | null) => {
        if (!file) return
        const formData = new FormData()
        formData.append('file', file, 'avatar.png')

        await updateAvatar.mutateAsync(formData)
      })
      onOpenChange(false)
      resetEditor()
    }

    const resetEditor = () => {
      setScale(1)
      setRotate(0)
    }

    const handleDeleteAvatar = async () => {
      await deleteAvatar.mutateAsync(Number(user.avatarId))
    }

    const handleWheel = (event: React.WheelEvent) => {
      setScale((prevScale) => {
        const newScale = prevScale + (event.deltaY < 0 ? 0.1 : -0.1)
        return Math.min(3, Math.max(1, newScale))
      })
    }

    return (
      <>
        <Popover>
          <Popover.Trigger className={'!p-0, relative'}>
            <UserAvatar
              user={user}
              className={classNames(
                styles.avatar,
                'hover:cursor-pointer hover:opacity-50',
                isSmall && styles.avatarSmall
              )}
            />
          </Popover.Trigger>
          <Popover.Content
            className={'w-max flex flex-col gap-1'}
            align={'center'}
            sideOffset={0}
          >
            <label
              htmlFor={inputId}
              className={
                'flex gap-2 p-2 hover:bg-hover hover:cursor-pointer rounded-lg items-center pr-6'
              }
            >
              <Edit className={'icon w-4 h-4'} />
              <p className={'body-14-16'}>Загрузить новый</p>
              <input
                type={'file'}
                className={'hidden'}
                id={inputId}
                accept='image/*'
                onChange={handleFileChange}
              />
            </label>
            {user.avatarId && (
              <div
                className={
                  'flex gap-2 p-2 hover:bg-hover rounded-lg items-center'
                }
                onClick={handleDeleteAvatar}
              >
                <Trash className={'iconRed w-4 h-4'} />
                <p className={'body-14-16 text-systemRed'}>Удалить</p>
              </div>
            )}
          </Popover.Content>
        </Popover>
        <Dialog open={open} onOpenChange={onOpenChange}>
          <Dialog.Content title={'Новый аватар'}>
            {previewUrl && (
              <div
                className={
                  'w-[844px] h-[616px] flex justify-center items-center border border-hover rounded-2xl'
                }
              >
                <div onWheel={handleWheel} className={'flex h-full'}>
                  <AvatarEditor
                    ref={editorRef}
                    image={previewUrl}
                    color={[0, 0, 0, 0.6]}
                    borderRadius={9999}
                    rotate={rotate}
                    scale={scale}
                    border={0}
                    style={{
                      width: '100%',
                      height: '100%',
                      maxWidth: '844px',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              </div>
            )}

            <div className='flex gap-2 items-center w-full justify-between'>
              <div className={'flex gap-2 p-2 border rounded-lg border-hover'}>
                <Wheel className={'w-5 h-5 iconSecondary'} />
                <p className={'body-12 secondaryText max-w-[265px]'}>
                  Чтобы увеличить или уменьшить фотографию, используйте колесико
                  мыши.
                </p>
              </div>
              <div className={'flex gap-2 items-center'}>
                <Button
                  styleButton={'outline'}
                  onClick={() => setRotate((prev) => (prev + 90) % 360)}
                  className={'w-[128px] body-14-16'}
                >
                  Повернуть
                </Button>

                <Button
                  styleButton={'filled'}
                  onClick={handleUploadAvatar}
                  className={'w-[128px] body-14-16'}
                >
                  Сохранить
                </Button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog>
      </>
    )
  }
)
