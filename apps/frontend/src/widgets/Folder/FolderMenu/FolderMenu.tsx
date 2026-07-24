import { yupResolver } from '@hookform/resolvers/yup'
import React, { FC, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import {
  Folder,
  IUpdateFolderDTO,
  folderMenuSchema,
  useFolders,
  usePermissionFolder
} from '@/entities/Folder'
import { nsObject } from '@/shared/lib/helpers/translation.helper'
import { IDialogReturn } from '@/shared/lib/hooks/useDialogAndPopover'
import { Button } from '@/shared/ui/Button/Button'
import { HorizontalLayout } from '@/shared/ui/HorizontalLayout/HorizontalLayout'
import { Input } from '@/shared/ui/Input/Input'
import { KbdElement } from '@/shared/ui/KbdElement/KbdElement'
import styles from './FolderMenu.module.scss'


type FormData = Omit<IUpdateFolderDTO, 'id'>

interface Props extends Pick<IDialogReturn, 'onOpenChange'> {
  folder: Folder
}

export const FolderMenu: FC<Props> = ({ onOpenChange, folder }) => {
  const { t } = useTranslation()
  const [isFocused, setIsFocused] = useState(false)
  const { deleteAsync, updateAsync, isTitleExistsInCurrentDirectory } =
    useFolders()

  const { canDeleteFolder, canEditFolder } = usePermissionFolder(folder)

  const handleDeleteFolder = async () => {
    await deleteAsync.mutateAsync(folder)

    onOpenChange(false)
  }

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<FormData>({
    defaultValues: { title: folder.title },
    resolver: yupResolver(
      folderMenuSchema(async function (value: any) {
        if (value) {
          return !isTitleExistsInCurrentDirectory(value)
        }
        return true
      })
    ),
    mode: 'onChange'
  })

  const onFolderUpdate = async (data: FormData) => {
    await updateAsync.mutateAsync({ id: folder.id, ...data })
    setIsFocused(false)
  }

  return (
    <div className={styles.body}>
      <form className={styles.fields} onSubmit={handleSubmit(onFolderUpdate)}>
        <HorizontalLayout labelText={'Название папки'}>
          <div className={'flex flex-col gap-1 max-w-[560px] w-full'}>
            <Input
              {...register('title')}
              disabled={!canEditFolder}
              maxLength={20}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
            >
              {isFocused && (
                <KbdElement kdb={'Enter'} tooltipContent={'Сохранить'} />
              )}
            </Input>
            {errors?.title?.message && (
              <p className={'body-12 text-systemRed'}>{errors.title.message}</p>
            )}
          </div>
        </HorizontalLayout>
      </form>
      {canDeleteFolder && (
        <div
          className={'flex justify-between w-full pt-6 self-end items-start'}
        >
          <div className={'flex flex-col gap-2 max-w-[585px]'}>
            <h4>Удалить папку</h4>
            <p className={'secondaryText body-14-16'}>
              Это действие удалит папку с вашего аккаунта. Если вы захотите ее
              восстановить, необходимо будет обратиться в поддержку.
            </p>
          </div>
          <Button
            colorButton={'red'}
            styleButton={'outline'}
            onClick={handleDeleteFolder}
            className={'w-[97px] max-h-12 body-16'}
            disabled={!canDeleteFolder}
          >
            {t('delete', nsObject())}
          </Button>
        </div>
      )}
    </div>
  )
}
