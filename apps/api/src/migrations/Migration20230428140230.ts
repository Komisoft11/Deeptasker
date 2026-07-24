import { Migration } from '@mikro-orm/migrations'

export class Migration20230428140230 extends Migration {

	async up(): Promise<void> {
		const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

		await knex.schema.createTable('workspace_user', builder => {
			builder.increments('id', { primaryKey: true })
			builder.integer('workspace_id').notNullable()
			builder.integer('user_id').notNullable()
			builder.dateTime('date_created', { useTz: false }).notNullable()

      builder
        .foreign('workspace_id', 'fk-workspace_user-workspace_id-workspace')
        .references('id')
        .inTable('workspace')
        .onDelete('CASCADE')

      builder
        .foreign('user_id', 'fk-workspace_user-user_id-user')
        .references('id')
        .inTable('user')
        .onDelete('CASCADE')

      builder.unique(['workspace_id', 'user_id'])
		})
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.dropTable('workspace_user')
  }

}
