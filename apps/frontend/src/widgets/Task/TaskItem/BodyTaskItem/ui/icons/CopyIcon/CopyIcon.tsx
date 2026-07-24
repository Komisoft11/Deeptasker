import React from 'react'
import { useTranslation } from 'react-i18next'
import { Copy } from '@/shared/assets/images/icons'
import { SUCCESS } from '@/shared/const/translation'
import { copyTextToClipboard } from '@/shared/lib/helpers/copyTextToClipboard'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'


export const CopyIcon = () => {
  const {
    taskStore: { activeTask }
  } = useRootStore()
  const { t } = useTranslation([SUCCESS])

  return (
    <div
      className={'iconContainer h-max'}
      onClick={() =>
        copyTextToClipboard(
          activeTask.title,
          t('task.titleCopied', { ns: SUCCESS }) as string
        )
      }
    >
      <Copy className='icon' />
    </div>
  )
}
