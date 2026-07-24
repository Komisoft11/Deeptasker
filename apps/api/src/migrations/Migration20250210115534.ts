import { Migration } from '@mikro-orm/migrations'

export class Migration20250210115534 extends Migration {
	private previousState: { id: number; generate_reports: boolean }[]

	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		this.previousState = await knex('project_permissions')
			.where('role', 'admin')
			.orWhere('role', 'assigner')
			.select('id', 'generate_reports')

		await knex('project_permissions').where('role', 'admin').orWhere('role', 'assigner').update({
			generate_reports: true
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		for (const state of this.previousState) {
			await knex('project_permissions').where('id', state.id).update({
				generate_reports: state.generate_reports
			})
			console.log('set previous permission state: ', state.id)
		}
	}
}
