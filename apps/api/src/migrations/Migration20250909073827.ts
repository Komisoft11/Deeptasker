import { Migration } from '@mikro-orm/migrations'

export class Migration20250909073827 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.dropTable('memberinvitation')
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.createTable('memberinvitation', tableBuilder => {
      tableBuilder.string('email').notNullable()
      tableBuilder.boolean('is_accepted').defaultTo(false)
      tableBuilder.dateTime('date_created')
      tableBuilder.dateTime('date_updated')
      tableBuilder.integer('project_id')
      tableBuilder
        .foreign('project_id', 'memberinvitation-project_id-project')
        .references('id')
        .inTable('project')
        .onDelete('CASCADE')
    })
  }
}
