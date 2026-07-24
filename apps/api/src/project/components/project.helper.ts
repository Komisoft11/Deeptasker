import { ProjectModel } from '../models/project.model'
import { BadRequestException } from '@nestjs/common'
import { I18nContext } from 'nestjs-i18n'

export const fetchWorkspaceAndCompareWithGiven = async (
	project: ProjectModel,
	givenWorkspaceId: number
) => {
	await project.$fetchGraph('workspace')

	if (project.workspaceId !== givenWorkspaceId) {
		throw new BadRequestException(
			I18nContext.current().t('project.project_workspace_does_not_match_requested_workspace', {
				lang: I18nContext.current().lang
			})
		)
	}
}
