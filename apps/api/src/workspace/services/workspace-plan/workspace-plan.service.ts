import { WorkspaceModel } from '../../models/workspace.model'
import { UserModel } from '../../../user/models/user.model'
import { GlobalRole } from '../../../user/access/enum.role'
import { PlanService } from '../../../payment/services/plan.service'

export class WorkspacePlanService {
  constructor(private readonly planService: PlanService) {}

  public async canCreateProjects(workspace: WorkspaceModel, user: UserModel): Promise<boolean> {
    if (user && user.role === GlobalRole.Admin) {
      return true
    }

    const projectLimit = await this.planService.getProjectLimit(user.id)

    const numProjects = await workspace
      .$relatedQuery('projects')
      .whereNull('dateDeleted')
      .resultSize()

    return numProjects < projectLimit
  }
}
