import classNames from 'classnames'
import { observer } from 'mobx-react-lite'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { formatDateTime } from '@/widgets/Task/TaskItem/TabsTaskItem/ui/CommentTab/helper/formatDateTime'
import { FileService } from '@/entities/File/services/file.service'
import { usePermissionProject } from '@/entities/Project'
import { IProjectReport } from '@/entities/Report'
import { useReports } from '@/entities/Report/lib/hooks/useReports'
import { Save, Trash } from '@/shared/assets/images/icons'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { Table } from '@/shared/ui/Table/Table'
import { createColumnHelper } from '@/shared/ui/Table/lib/createColumnHelper'
import styles from './ReportsTable.module.scss'


export const ReportsTable = observer(() => {
  const {
    projectStore: { activeProject }
  } = useRootStore()
  const {
    permissions: { deleteReports }
  } = usePermissionProject()
  const { reports, deleteAsync } = useReports(activeProject)
  const columnHelper = createColumnHelper<IProjectReport>()
  const { t } = useTranslation()

  const statusColors: Record<IProjectReport['status'], string> = {
    pending: 'var(--text-second)',
    error: 'var(--system-red)',
    completed: 'var(--system-green)',
    in_progress: 'var(--text-second)'
  }

  const handleDelete = async (report: IProjectReport) => {
    await deleteAsync.mutateAsync(report)
  }

  const columns = [
    columnHelper.accessor({
      id: 'title',
      header: () => 'Название',
      cell: (report) => <p className={'ellipsis'}>{report.title}</p>
    }),
    columnHelper.accessor({
      id: 'reportPeriod',
      header: () => 'Период',
      cell: (report) =>
        `${formatDateTime({
          date: report.periodStart,
          includeTime: false
        })} - ${formatDateTime({
          date: report.periodEnd,
          includeTime: false
        })} `
    }),
    columnHelper.accessor({
      id: 'status',
      header: () => 'Статус',
      cell: (report) => (
        <span
          style={{
            color: statusColors[report.status]
          }}
        >
          {t(`report.statuses.${report.status}`)}
        </span>
      )
    }),
    columnHelper.accessor({
      id: 'actions',
      header: () => 'Действия',
      cell: (report) => {
        const downloadUrl = FileService.downloadReportUrl(report.id)
        return (
          <div className={'flex gap-1'}>
            <a href={`${downloadUrl}?download`} className='iconContainer'>
              <Save />
            </a>
            {deleteReports && (
              <div
                className={'iconContainer'}
                onClick={() => handleDelete(report)}
              >
                <Trash className={'iconRed w-4 h-4'} />
              </div>
            )}
          </div>
        )
      }
    })
  ]

  return (
    <Table className={'body-14-16 px-4 pb-4 overflow-visible'}>
      <Table.Head>
        <Table.Row className={styles.headerTableRow}>
          {columns.map((c) => (
            <Table.Cell
              key={c.id}
              style={{
                width: c.size,
                minWidth: c.minSize,
                maxWidth: c.maxSize
              }}
              className={styles.cell}
              data-cell={c.id}
            >
              {c.header()}
            </Table.Cell>
          ))}
        </Table.Row>
      </Table.Head>
      <Table.Body className={'flex flex-col'}>
        {reports?.map((report) => (
          <Table.Row className={classNames(styles.tableRow)} key={report.id}>
            {columns.map((c) => {
              return (
                <Table.Cell
                  key={c.id}
                  style={{
                    width: c.size,
                    minWidth: c.minSize,
                    maxWidth: c.maxSize
                  }}
                  data-cell={c.id}
                  className={styles.cell}
                >
                  {c.cell(report)}
                </Table.Cell>
              )
            })}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
})
