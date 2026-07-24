import { Migration } from '@mikro-orm/migrations'

export class Migration20240620141812 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		const projects = await knex('project').select(['id'])

		let counter: number = 0
		for (const project of projects) {
			await this.fillCustomOrder(project, knex)
			counter++
		}

		console.log('[+] Processed all tasks in ' + counter + ' projects')

		const statuses = await knex('task_status').select(['id'])

		counter = 0
		for (const status of statuses) {
			await this.fillStatusOrder(status, knex)
			counter++
		}

		console.log('[+] Processed all tasks in ' + counter + ' statuses')
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex('task')
			.update({
				custom_order: 0,
				status_order: 0
			})
			.andWhere('date_deleted', '=', null)
	}

	private async fillCustomOrder(project: any, knex: any): Promise<void> {
		const tasks = await knex('task')
			.where('project_id', project.id)
			.andWhere('date_deleted', null)
			.orderBy('id', 'desc')

		let customOrder: number = 1

		for (const task of tasks) {
			await knex('task')
				.update({
					custom_order: customOrder
				})
				.where('id', task.id)

			customOrder++
		}
	}

	private async fillStatusOrder(status: any, knex: any): Promise<void> {
		const tasks = await knex('task')
			.where('status_id', status.id)
			.andWhere('date_deleted', null)
			.orderBy('id', 'desc')

		let statusOrder: number = 1

		for (const task of tasks) {
			await knex('task')
				.update({
					status_order: statusOrder
				})
				.where('id', task.id)

			statusOrder++
		}
	}
}
