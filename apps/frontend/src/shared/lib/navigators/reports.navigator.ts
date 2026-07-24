import {
  PROJECTS_CREATE_REPORT,
  REPORTS_URL,
  SPACE_URL
} from '@/shared/config/route.config'
import { IUrlOptions } from '@/shared/types/navigator.intreface'

interface ProjectCreateReportUrlDto extends IUrlOptions {
  currentWorkspaceId: number
  projectSlug: string
}

interface ProjectReportsUrlDto {
  currentWorkspaceId: number
  projectSlug: string
}

export const ReportsNavigator = {
  getProjectReports({
    currentWorkspaceId,
    projectSlug
  }: ProjectReportsUrlDto): string {
    return `${SPACE_URL}/${currentWorkspaceId}/p/${projectSlug}/${REPORTS_URL}`
  },

  getProjectCreateReport(dto: ProjectCreateReportUrlDto): string {
    return this.getProjectReports(dto) + `/${PROJECTS_CREATE_REPORT}`
  }
} as const
