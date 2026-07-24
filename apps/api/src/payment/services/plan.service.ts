import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { I18nService } from 'nestjs-i18n'
import { WorkspaceModel } from '../../workspace/models/workspace.model'
import { PlanModel } from '../models/plan.model'
import { IProjectWithWorkspace, ProjectModel } from '../../project/models/project.model'
import { UserPlanModel } from '../models/user-plan.model'
import { getCurrentUTCDateTime } from '../../common/helpers/date'
import { TransactionOrKnex } from 'objection'
import { MyBaseModel } from '../../common/database/base.model'
import { PaymentModel } from '../models/payment.model'
import { ProjectService } from '../../project/services/project/project.service'
import type { ProjectService as ProjectServiceType } from '../../project/services/project/project.service'
import { UserModel } from '../../user/models/user.model'
import { GlobalRole } from '../../user/access/enum.role'

export const DEFAULT_PLAN = 'default'
export const FREE_PLAN_WORKSPACES_LIMIT = 5
export const FREE_PLAN_PROJECT_LIMIT = 15
export const FREE_PLAN_PROJECT_MEMBERS_LIMIT = 20
export const FREE_PLAN_AI_TASK_TITLE = false

export enum PlanType {
  free = 'free',
  pro = 'pro',
  business = 'business'
}

@Injectable()
export class PlanService {
  constructor(
    private readonly i18n: I18nService,
    @Inject(forwardRef(() => ProjectService)) private readonly projectService: ProjectServiceType
  ) {}

  public async getPlan(planId: number): Promise<PlanModel> {
    const plan = await PlanModel.query().findOne({ id: planId })

    if (!plan) {
      throw new NotFoundException(this.i18n.t('workspace.plan_not_found'))
    }

    return plan
  }

  public async getProjectLimit(userId: number): Promise<number> {
    const plan = this.getCurrentActivePlanQuery(userId).select('plan.num_projects')

    return (await plan).numProjects
  }

  public async activatePlan(payment: PaymentModel, trx?: TransactionOrKnex) {
    const transaction = await MyBaseModel.startTransaction(trx)

    try {
      // deactivate current active user plan
      await UserPlanModel.query(transaction)
        .patch({
          dateActive: null
        })
        .where('userId', payment.userId)

      // create new user plan
      const newUserPlan = await this.createUserPlan(payment, transaction)

      const currentDate = getCurrentUTCDateTime()

      // activate it
      await newUserPlan.$query(transaction).patch({
        dateActive: currentDate,
        dateExpire: new Date(currentDate.setMonth(currentDate.getMonth() + payment.months))
      })

      await transaction.commit()
    } catch (e) {
      console.error(e)
      await transaction.rollback()

      throw Error('Failed switching plans' + e.getMessage())
    }
  }

  public async getCurrentActivePlan(userId: number): Promise<PlanModel | undefined> {
    return this.getCurrentActivePlanQuery(userId)
      .withGraphJoined('active')
      .modifyGraph('active', query => {
        query.whereNotNull('dateActive').where('userPlan.dateExpire', '>=', getCurrentUTCDateTime())
      })
  }

  private async getCurrentActiveUserPlan(userId: number): Promise<UserPlanModel> {
    return UserPlanModel.query()
      .where('userId', userId)
      .whereNotNull('dateActive')
      .where('userPlan.dateExpire', '>=', getCurrentUTCDateTime())
      .first()
  }

  public async canCreateProjects(workspace: WorkspaceModel, user: UserModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    const currentNumberOfProjects: number = await ProjectModel.query()
      .where('workspaceId', workspace.id)
      .andWhere('dateDeleted', null)
      .andWhere('dateArchived', null)
      .onlyCount()

    const currentPlanOfWorkspaceOwner = await this.getCurrentActivePlan(workspace.userId)

    const projectLimit = currentPlanOfWorkspaceOwner
      ? currentPlanOfWorkspaceOwner.numProjects
      : FREE_PLAN_PROJECT_LIMIT

    return currentNumberOfProjects < projectLimit
  }

  public async canUnArchiveProject(project: ProjectModel, user: UserModel): Promise<boolean> {
    const workspace = await WorkspaceModel.query().findById(project.workspaceId)

    return this.canCreateProjects(workspace, user)
  }

  public async canCreateWorkspaces(user: UserModel): Promise<boolean> {
    if (user.role === GlobalRole.Admin) {
      return true
    }

    const currentNumberOfWorkspaces: number = await WorkspaceModel.query()
      .where('userId', user.id)
      .andWhere('dateDeleted', null)
      .onlyCount()

    const currentPlan = await this.getCurrentActivePlan(user.id)

    const wsLimit = currentPlan ? currentPlan.numWorkspaces : FREE_PLAN_WORKSPACES_LIMIT

    return currentNumberOfWorkspaces < wsLimit
  }

  public async canAddUserToProject(project: IProjectWithWorkspace): Promise<boolean> {
    const workspace = await WorkspaceModel.query()
      .alias('w')
      .findById(project.workspaceId)
      .select(['w.id', 'w.userId'])
      .withGraphJoined('user(selectRole)')

    if (workspace.user.role === GlobalRole.Admin) {
      return true
    }

    const currentNumberOfUsersInProject: number = await this.projectService.getNumberOfMembers(
      project
    )

    const currentPlan = await this.getCurrentActivePlan(workspace.userId)

    const userLimit = currentPlan ? currentPlan.numMembers : FREE_PLAN_PROJECT_MEMBERS_LIMIT

    return currentNumberOfUsersInProject < userLimit
  }

  public async getDefaultPlan(): Promise<PlanModel> {
    return PlanModel.query().findOne('code', PlanType.free)
  }

  public async getAllPlans(userId: number): Promise<PlanModel[]> {
    const plans = await PlanModel.query().where('dateDeleted', null)

    await this.markActivePlan(userId, plans)

    return plans
  }

  private async createUserPlan(
    payment: PaymentModel,
    trx?: TransactionOrKnex
  ): Promise<UserPlanModel> {
    return UserPlanModel.query(trx).insert({
      userId: payment.userId,
      planId: payment.planId,
      paymentId: payment.id
    })
  }

  private getCurrentActivePlanQuery(userId: number) {
    return PlanModel.query()
      .alias('p')
      .joinRelated('userPlans', { alias: 'up' })
      .where('up.userId', userId)
      .whereNotNull('up.dateActive')
      .where('up.dateExpire', '>=', getCurrentUTCDateTime())
      .first()
  }

  private async markActivePlan(userId: number, plans: PlanModel[]) {
    const activeUserPlan = await this.getCurrentActiveUserPlan(userId)

    if (activeUserPlan) {
      for (const plan of plans) {
        if (plan.id === activeUserPlan.planId) {
          plan.active = activeUserPlan
        }
      }
    }
  }
}
