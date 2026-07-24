import { Migration } from '@mikro-orm/migrations'

export class Migration20240930142509 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('project_permissions', builder => {
			builder.boolean('create_folders')
			builder.boolean('edit_folders')
			builder.boolean('delete_folders')
		})

		const projectPermissions: {
			project_id: number
			user_id: number
			role: string
		}[] = await knex('project_permissions').where('role', '!=', 'guest')

		for (const projectPermission of projectPermissions) {
			console.log(projectPermission)
			await knex('project_permissions').update({
				create_folders: true,
				edit_folders: projectPermission.role !== 'user',
				delete_folders: projectPermission.role !== 'user'
			})
		}
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('project_permissions', builder => {
			builder.dropColumn('create_folders')
			builder.dropColumn('edit_folders')
			builder.dropColumn('delete_folders')
		})
	}
}
