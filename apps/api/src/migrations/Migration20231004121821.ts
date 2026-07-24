import {Migration} from '@mikro-orm/migrations';

export class Migration20231004121821 extends Migration {

    async up(): Promise<void> {
        const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

        await knex.schema.createTable('workspace_plan', builder => {
            builder.increments('id', {primaryKey: true})
            builder.string('name').notNullable().unique()
            builder.string('code').unique()
            builder.integer('price').unsigned().notNullable()

            builder.integer('num_projects').unsigned().notNullable()
            builder.integer('num_members').unsigned().notNullable()

            builder.dateTime('date_created', {useTz: false}).notNullable()
            builder.dateTime('date_updated', {useTz: false})
        })

        await knex.schema.createTable('payment', builder => {
            builder.increments('id', {primaryKey: true})
            builder.string('external_id').unique()
            builder.integer('amount').unsigned().notNullable()
            builder.enum('status', ['wait', 'success', 'canceled', 'refund']).notNullable()
            builder.integer('user_id').notNullable()
            builder.integer('workspace_id').notNullable()
            builder.integer('workspace_plan_id').notNullable()
            builder.dateTime('date_created', {useTz: false}).notNullable()
            builder.dateTime('date_updated', {useTz: false})

            builder
                .foreign('user_id', 'fk-payment-user_id-user')
                .references('user.id')
                .onDelete('CASCADE')
            builder
                .foreign('workspace_id', 'fk-payment-workspace_id-workspace')
                .references('workspace.id')
                .onDelete('CASCADE')
            builder
                .foreign('workspace_plan_id', 'fk-payment-workspace_plan_id-workspace_plan')
                .references('workspace_plan.id')
                .onDelete('CASCADE')
        })

        await knex.schema.alterTable('workspace', builder => {
            builder.integer('workspace_plan_id')

            builder
                .foreign('workspace_plan_id', 'fk-workspace-workspace_plan_id-workspace_plan')
                .references('workspace_plan.id')
                .onDelete('SET NULL')
        })
    }

    async down(): Promise<void> {
        const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

        await knex.schema.alterTable('workspace', builder => {
            builder.dropForeign('workspace_plan_id', 'fk-workspace-workspace_plan_id-workspace_plan')
            builder.dropColumn('workspace_plan_id')
        })

        await knex.schema.dropTable('payment')
        await knex.schema.dropTable('workspace_plan')
    }
}
