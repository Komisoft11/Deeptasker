import { Migration } from '@mikro-orm/migrations'
import { randomUUID } from 'crypto'
import { Knex } from '@mikro-orm/postgresql'

export class Migration20230405132918 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTable('workspace', builder => {
			builder.increments('id', { primaryKey: true })
			builder.string('title').notNullable()
			builder.uuid('uuid').notNullable().unique()
			builder.integer('user_id').notNullable()
			builder.dateTime('date_created', { useTz: false }).notNullable()
			builder.dateTime('date_updated', { useTz: false })
			builder.dateTime('date_deleted', { useTz: false })

			builder.foreign('user_id', 'fk-workspace-user_id-user').references('id').inTable('user')
		})

		await knex.schema.alterTable('project', builder => {
			builder.integer('workspace_id')
			builder.uuid('uuid')
		})

		await Migration20230405132918.attachExistingProjectsToDefaultWorkspace(knex)

		await knex.schema.alterTable('project', builder => {
			builder.uuid('uuid').notNullable().unique().alter()

			builder.integer('workspace_id').notNullable().alter()
			builder
				.foreign('workspace_id', 'fk-project-workspace_id-workspace')
				.references('id')
				.inTable('workspace')
		})
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.alterTable('project', builder => {
			builder.dropColumn('workspace_id')
			builder.dropColumn('uuid')
		})

		await knex.schema.dropTable('workspace')
	}

	private static async attachExistingProjectsToDefaultWorkspace(knex: Knex<any, any[]>) {
		const users = await knex('user').select('id')

		for (const user of users) {
			const workspaceId = (
				await knex('workspace')
					.insert({
						title: 'My workspace',
						uuid: randomUUID(),
						user_id: user.id,
						date_created: new Date()
					})
					.returning('id')
			)[0].id

			const projects = await knex('project')
				.select('id')
				.where('user_id', user.id)
				.pluck<number[]>('id')

			await Promise.all(
				projects.map(projectId => {
					return knex('project')
						.update({
							workspace_id: workspaceId,
							uuid: randomUUID()
						})
						.where('id', projectId)
				})
			)
		}
	}
}
