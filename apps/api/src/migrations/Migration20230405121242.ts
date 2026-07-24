import { Migration } from '@mikro-orm/migrations';

export class Migration20230405121242 extends Migration {

  async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('user', builder => {
      builder.string('icon_bg').defaultTo('#f00000').notNullable()
      builder.string('icon_fg').defaultTo('#ffffff').notNullable()
    })

    await knex.schema.alterTable('project', builder => {
      builder.string('icon_bg').defaultTo('#f00000').notNullable()
      builder.string('icon_fg').defaultTo('#ffffff').notNullable()
    })
  }

  async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.alterTable('user', builder => {
      builder.dropColumn('icon_bg')
      builder.dropColumn('icon_fg')
    })

    await knex.schema.alterTable('project', builder => {
      builder.dropColumn('icon_bg')
      builder.dropColumn('icon_fg')
    })
  }

}
