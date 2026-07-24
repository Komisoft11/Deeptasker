import { Migration } from '@mikro-orm/migrations'
import dayjs from 'dayjs'

export class Migration20240528133358 extends Migration {
	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		////////////////
		await knex.schema.alterTable('workspace_plan', builder => {
			builder.integer('num_workspaces').unsigned().defaultTo(5)
			builder.boolean('ai_task_title').defaultTo(false)
			builder.dateTime('date_deleted', { useTz: false })
		})

		await knex.schema.alterTable('workspace', builder => {
			builder.dropColumn('workspace_plan_id')
		})

		await knex.schema.renameTable('workspace_plan', 'plan')
		////////////////

		await knex.schema.createTable('user_plan', builder => {
			builder.increments('id', { primaryKey: true })
			builder.integer('plan_id').notNullable()
			builder.integer('user_id').notNullable()
			builder.integer('payment_id').notNullable()

			builder.dateTime('date_active', { useTz: false })
			builder.dateTime('date_expire', { useTz: false })

			builder.dateTime('date_created', { useTz: false }).notNullable()
			builder.dateTime('date_updated', { useTz: false })

			builder.foreign('user_id').references('user.id').onDelete('CASCADE')
			builder.foreign('plan_id').references('plan.id').onDelete('CASCADE')
			builder.foreign('payment_id').references('payment.id').onDelete('CASCADE')
		})

		////////////////
		await knex('payment').delete()
		await knex.schema.alterTable('payment', builder => {
			builder.dropColumn('workspace_id')
			builder.dropColumn('workspace_plan_id')

			builder.integer('months').notNullable().defaultTo(1)
			builder.integer('plan_id').notNullable()

			builder.foreign('plan_id').references('plan.id').onDelete('CASCADE')
		})

		///// default plans ////
		await knex('plan').delete()
		await knex('plan').insert([
			{
				num_projects: 15,
				num_members: 20,
				ai_task_title: false,
				num_workspaces: 5,
				name: 'Free plan',
				price: 0,
				code: 'free',
				date_created: new Date()
			},
			{
				num_projects: 20,
				num_members: 20,
				ai_task_title: true,
				num_workspaces: 10,
				name: 'Pro',
				price: 150,
				code: 'pro',
				date_created: new Date()
			},
			{
				num_projects: 9001,
				num_members: 9001,
				ai_task_title: true,
				num_workspaces: 9001,
				name: 'Business',
				price: 4950,
				code: 'business',
				date_created: new Date()
			}
		])
	}

	async down(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		///////////////

		await knex.schema.dropTable('user_plan')

		await knex.schema.alterTable('plan', builder => {
			builder.dropColumn('num_workspaces')
			builder.dropColumn('ai_task_title')
			builder.dropColumn('date_deleted')
		})

		await knex.schema.renameTable('plan', 'workspace_plan')

		await knex.schema.alterTable('workspace', builder => {
			builder.integer('workspace_plan_id')
			builder.foreign('workspace_plan_id').references('workspace_plan.id')
		})

		////////////////
		await knex.schema.alterTable('payment', builder => {
			builder.integer('workspace_id')
			builder.integer('workspace_plan_id')

			builder.dropColumn('plan_id')
			builder.dropColumn('months')

			builder.foreign('workspace_id').references('workspace.id')
			builder.foreign('workspace_plan_id').references('workspace_plan.id')
		})

		await knex('workspace_plan').delete()
		await knex('workspace_plan').insert({
			num_projects: 15,
			num_members: 20,
			name: 'Free plan',
			price: 0,
			code: 'free',
			date_created: dayjs().toDate()
		})
	}
}
