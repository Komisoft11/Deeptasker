import { useQuery, useQueryClient } from '@tanstack/react-query'
import { UseMutationResult } from '@tanstack/react-query/src/types'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { Project, ProjectService } from '@/entities/Project'
import {
  IProjectReport,
  IProjectReportDTO,
  ReportStatus,
  reportsQueries
} from '@/entities/Report'
import { useCreateMutation } from '@/entities/lib/useCreateMutation'
import { ERRORS, SUCCESS } from '@/shared/const/translation'
import { useRootStore } from '@/shared/lib/hooks/useRootStore'
import { ReportsNavigator } from '@/shared/lib/navigators/reports.navigator'
import { ICreatedRecord } from '@/shared/types/created-record.interface'
import { showToast } from '@/shared/ui/ToastNotification/ToastNotification'

interface IReturn {
  reports: IProjectReport[] | undefined
  createAsync: UseMutationResult<ICreatedRecord, unknown, IProjectReportDTO>
  deleteAsync: UseMutationResult<void, unknown, IProjectReport>
}

export const useReports = (
  project: Project,
  isReportsPage?: boolean
): IReturn => {
  const {
    workspaceStore: { activeWorkspace }
  } = useRootStore()

  const { data: reports } = useQuery({
    queryKey: reportsQueries.reports(project).queryKey,
    queryFn: reportsQueries.reports(project).queryFn,
    enabled: !!project && isReportsPage
  })

  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { t } = useTranslation([SUCCESS, ERRORS])

  const createAsync = useCreateMutation<
    ICreatedRecord,
    unknown,
    IProjectReportDTO
  >({
    mutationKey: ['create report'],
    mutationFn: async (
      reportDTO: IProjectReportDTO
    ): Promise<ICreatedRecord> => {
      return await ProjectService.createReport(reportDTO, project.id)
    },
    onSuccess: (data, variables) => {
      queryClient.setQueryData(
        reportsQueries.reports(project).queryKey,
        (old: IProjectReport[]) =>
          old
            ? [
                ...old,
                {
                  ...variables,
                  id: data.id,
                  uuid: data.uuid,
                  status: ReportStatus.Pending
                }
              ]
            : old
      )
      navigate(
        ReportsNavigator.getProjectReports({
          currentWorkspaceId: activeWorkspace.id,
          projectSlug: project.slug
        })
      )
      showToast({
        title: t('report.create.title', {
          ns: SUCCESS,
          title: variables.title
        }),
        type: 'success',
        text: t('report.create.text', { ns: SUCCESS }) as string
      })
    },
    onError: (_, variables) => {
      showToast({
        title: t('report.create.title', { ns: ERRORS, title: variables.title }),
        type: 'error',
        text: t('report.create.text', { ns: ERRORS }) as string
      })
    }
  })

  const deleteAsync = useCreateMutation<void, unknown, IProjectReport>({
    mutationKey: ['delete report'],
    mutationFn: async (report: IProjectReport): Promise<void> => {
      return await ProjectService.deleteReport(report.uuid, project.id)
    },
    onSuccess: (_, report) => {
      showToast({
        title: t('report.deleted', { ns: SUCCESS, title: report.title }),
        type: 'success'
      })
      queryClient.setQueryData<IProjectReport[]>(
        reportsQueries.reports(project).queryKey,
        (old) => (old ? old.filter((r) => r.uuid !== report.uuid) : old)
      )
    },
    onError: (_, variables) => {
      showToast({
        title: t('report.deleted', { ns: ERRORS, title: variables.title }),
        type: 'error'
      })
    }
  })

  return {
    reports,
    createAsync,
    deleteAsync
  }
}
