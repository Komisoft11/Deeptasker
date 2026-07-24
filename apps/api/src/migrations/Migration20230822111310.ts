import { Migration } from '@mikro-orm/migrations'
import { Knex } from '@mikro-orm/postgresql'

interface IProject {
	id: number,
	user_id: number,
	workspace_id: number
}

interface IWorkspace {
	id: number,
	user_id: number,
}

export class Migration20230822111310 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		const projects: IProject[] = await knex('project').select(['id', 'user_id', 'workspace_id'])

		let i = 0;
		for (const project of projects) {
			await this.giveProjectPermissions(project, knex)
			i++;
		}

		console.log('[+] Processed ' + i + ' projects')

		const workspaces: IWorkspace[] = await knex('workspace').select(['id', 'user_id'])

		i = 0;
		for (const workspace of workspaces) {
			await this.giveWorkspacePermissions(workspace, knex)
			i++;
		}

		console.log('[+] Processed ' + i + ' workspaces')
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex('project_permissions').delete()
		await knex('workspace_permissions').delete()
	}

	private async giveProjectPermissions(project: IProject, knex: Knex) {
		const projectAdminIds: number[] = await knex('project_user')
			.select('user_id')
			.where('project_id', project.id)
			.where('access', 'admin')
			.pluck('user_id')

		projectAdminIds.push(project.user_id)

		const workspaceAdminIds: number[] = await knex('workspace_user')
			.select('user_id')
			.where('workspace_id', project.workspace_id)
			.pluck('user_id')

		const insertRows = projectAdminIds.map(userId => {
			return {
				project_id: project.id,
				user_id: userId,
				create_subprojects: true,
				edit: true,
				add_users: true,
				remove_users: true,
				list_tasks: true,
				open_tasks: true,
				create_tasks: true,
				move_tasks: true,
				manage_admins: true,
				assigner: true,
				controller: true,
				delete: userId === project.user_id
			}
		})

		insertRows.push(...workspaceAdminIds.map(userId => {
			return {
				project_id: project.id,
				user_id: userId,
				create_subprojects: true,
				edit: true,
				add_users: true,
				remove_users: true,
				list_tasks: true,
				open_tasks: true,
				create_tasks: true,
				move_tasks: true,
				manage_admins: true,
				assigner: true,
				controller: true,
				delete: true
			}
		}))

		await knex('project_permissions')
			.insert(insertRows)
			.onConflict(['project_id', 'user_id'])
			.ignore()
	}

	private async giveWorkspacePermissions(workspace: IWorkspace, knex: Knex) {
		const workspaceAdminIds: number[] = await knex('workspace_user')
			.select('user_id')
			.where('workspace_id', workspace.id)
			.pluck('user_id')

		workspaceAdminIds.push(workspace.user_id)

		const insertRows = workspaceAdminIds.map(userId => {
			return {
				workspace_id: workspace.id,
				user_id: userId,
				create_projects: true,
				delete_projects: true,
				edit_projects: true,
				manage_admins: true,
				edit: true,
				delete: userId === workspace.user_id
			}
		})

		await knex('workspace_permissions')
			.insert(insertRows)
			.onConflict(['workspace_id', 'user_id'])
			.ignore()
	}
}
