import { FC } from 'react'
import { useTranslation } from 'react-i18next'


export const WorkspaceEmpty: FC = () => {
  const { t } = useTranslation()
  return (
    <div className={'flex items-center justify-center mt-10'}>
      <p className={'p-4 text-xl'}>{t('workspace.empty')}</p>
    </div>
  )
}
