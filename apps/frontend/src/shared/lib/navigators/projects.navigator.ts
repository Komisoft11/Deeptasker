import {
  PROJECTS_SLUG_URL,
  PROJECTS_TEMPLATE_URL,
  PROJECTS_URL,
  SPACE_URL,
  optionProjectTabs
} from '@/shared/config/route.config'
import { IUrlOptions, TabOptions } from '@/shared/types/navigator.intreface'

interface IExistProjectUrlDto extends IUrlOptions {
  currentWorkspaceId: number
  projectSlug: string
}

interface IOpenTaskUrlDto extends IExistProjectUrlDto {
  externalId: string
}

interface ProjectUrlWithIdDto extends IUrlOptions {
  currentWorkspaceId: number
  projectId: number
  tab?: TabOptions
}

const mapParamsToUrl = (params: URLSearchParams): string => {
  if (!params.size) {
    return ''
  }

  let url = ''

  params.forEach((value, key) => {
    if (!url.length) {
      url = `?${key}=${value}`
    } else {
      url += `&${key}=${value}`
    }
  })

  return url
}

export const ProjectsNavigator = {
  getExistProjectUrl({
    currentWorkspaceId,
    projectSlug,
    view = 'table',
    folderId,
    params
  }: IExistProjectUrlDto): string {
    let url = `${SPACE_URL}/${currentWorkspaceId}/${PROJECTS_SLUG_URL}/${projectSlug}`

    if (folderId) {
      url += `/folder/${folderId}`
    }

    url += `/${view}`

    if (params) {
      url += mapParamsToUrl(params)
    }

    return url
  },

  getOpenTaskUrl({
    currentWorkspaceId,
    projectSlug,
    externalId,
    folderId,
    params
  }: IOpenTaskUrlDto): string {
    let url = `${SPACE_URL}/${currentWorkspaceId}/${PROJECTS_SLUG_URL}/${projectSlug}`

    if (folderId) {
      url += `/folder/${folderId}`
    }

    url += `/${externalId}`

    if (params) {
      url += mapParamsToUrl(params)
    }

    return url
  },

  getProjectTemplateCreatorUrl(spaceId: number): string {
    return `${SPACE_URL}/${spaceId}/${PROJECTS_URL}/${PROJECTS_TEMPLATE_URL}`
  },

  getProjectUrlWithId({
    currentWorkspaceId,
    projectId,
    tab = optionProjectTabs.GENERAL
  }: ProjectUrlWithIdDto): string {
    return `${SPACE_URL}/${currentWorkspaceId}/${PROJECTS_URL}/${projectId}/${tab}`
  }
} as const
