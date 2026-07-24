import React from 'react'
import { useTranslation } from 'react-i18next'
import { ReportsContent } from '@/features/Report/ReportsContent/ReportsContent'
import { usePermissionProject } from '@/entities/Project'
import { ENTITY } from '@/shared/const/translation'
import { Header } from '@/shared/ui/Header/Header'


export const ReportsPage = () => {
  const {
    permissions: { listReports }
  } = usePermissionProject()
  const { t } = useTranslation([ENTITY])

  return (
    <div className={'flex h-full w-full flex-col overflow-hidden'}>
      <Header
        title={t('report.title', { ns: ENTITY })}
        withProjectSidebarOpen
      />
      <div className={'flex h-full flex-col overflow-hidden'}>
        {listReports ? (
          <ReportsContent />
        ) : (
          <div
            className={'p-4 secondaryText body-12 w-full flex justify-center'}
          >
            <p className={'body-14-16'}>
              {t('report.noProjectReportsAccess', { ns: ENTITY })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
