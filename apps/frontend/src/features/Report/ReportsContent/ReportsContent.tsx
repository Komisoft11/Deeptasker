import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CreateProjectReport } from '@/features/Report/CreateProjectReport/CreateProjectReport'
import { ReportsTable } from '@/features/Report/ReportsTable/ReportsTable'
import { usePermissionProject } from '@/entities/Project'
import { useReports } from '@/entities/Report/lib/hooks/useReports'
import { Plus } from '@/shared/assets/images/icons'
import { ENTITY, PLACEHOLDERS } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { FooterButton } from '@/shared/ui/FooterButton/FooterButton'
import { Loading } from '@/shared/ui/Loading/Loading'


export const ReportsContent = observer(() => {
  const {
    projectStore: { activeProject }
  } = useRootStore()
  const { t } = useTranslation([PLACEHOLDERS, ENTITY])

  const {
    permissions: { generateReports }
  } = usePermissionProject()

  const [isAddReport, setIsAddReport] = useState(false)

  const { reports } = useReports(activeProject, true)

  const isHidden = !isAddReport && generateReports

  if (!reports) return <Loading variant={'spinner'} />

  return (
    <>
      <div
        className={classNames(
          'flex flex-col overflow-y-auto gap-4 flex-1 w-full h-full',
          'scrollbarContainerOnBg'
        )}
      >
        {isAddReport ? (
          <CreateProjectReport
            className={'w-full gap-6 rounded-lg h-max px-4 pt-4'}
            containerClassName={'!p-0'}
            isAddReport={isAddReport}
            setIsAddReport={setIsAddReport}
          />
        ) : reports.length > 0 ? (
          <ReportsTable />
        ) : (
          <p className={'secondaryText body-12 px-4 pt-4'}>
            {t('projectReports', { ns: PLACEHOLDERS })}
          </p>
        )}
      </div>
      {isHidden && (
        <FooterButton
          onClick={() => setIsAddReport(!isAddReport)}
          buttonText={t('report.create', { ns: ENTITY })}
          styleButton={'filled'}
          colorButton={'dark'}
          Icon={Plus}
        />
      )}
    </>
  )
})
