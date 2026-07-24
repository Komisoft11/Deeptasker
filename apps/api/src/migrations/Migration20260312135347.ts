import { Migration } from '@mikro-orm/migrations'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export class Migration20260312135347 extends Migration {
  public async up(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    // Согласие на обработку персональных данных
    await knex.schema.createTable('consent', builder => {
      builder.increments('id', { primaryKey: true })
      builder.string('title').defaultTo('cогласие на обработку персональных данных')
      builder.string('link')
      builder.string('version').notNullable().unique()
      builder.dateTime('date_created', { useTz: true }).notNullable()
      builder.dateTime('date_published', { useTz: true })
      builder.dateTime('date_expired', { useTz: true })
    })

    // Политика обработки персональных данных
    await knex.schema.createTable('personal_data_policy', builder => {
      builder.increments('id', { primaryKey: true })
      builder.string('title').defaultTo('политика обработки персональных данных')
      builder.string('link')
      builder.string('version').notNullable().unique()
      builder.dateTime('date_created', { useTz: true }).notNullable()
      builder.dateTime('date_published', { useTz: true })
      builder.dateTime('date_expired', { useTz: true })
    })

    // Политика конфиденциальности
    await knex.schema.createTable('privacy_policy', builder => {
      builder.increments('id', { primaryKey: true })
      builder.string('title').defaultTo('политика конфиденциальности')
      builder.string('link')
      builder.string('version').notNullable().unique()
      builder.dateTime('date_created', { useTz: true }).notNullable()
      builder.dateTime('date_published', { useTz: true })
      builder.dateTime('date_expired', { useTz: true })
    })

    // Пользовательское соглашение
    await knex.schema.createTable('user_agreement', builder => {
      builder.increments('id', { primaryKey: true })
      builder.string('title').defaultTo('пользовательское соглашение')
      builder.string('link')
      builder.string('version').notNullable().unique()
      builder.dateTime('date_created', { useTz: true }).notNullable()
      builder.dateTime('date_published', { useTz: true })
      builder.dateTime('date_expired', { useTz: true })
    })

    // Правила пользования
    await knex.schema.createTable('terms_of_use', builder => {
      builder.increments('id', { primaryKey: true })
      builder.string('title').defaultTo('правила пользования')
      builder.string('link')
      builder.string('version').notNullable().unique()
      builder.dateTime('date_created', { useTz: true }).notNullable()
      builder.dateTime('date_published', { useTz: true })
      builder.dateTime('date_expired', { useTz: true })
    })

    await knex.schema.createTable('user_documents', builder => {
      builder.increments('id', { primaryKey: true })
      builder.integer('user_id').unsigned()
      builder.integer('consent_id').unsigned()
      builder.integer('personal_data_policy_id').unsigned()
      builder.integer('privacy_policy_id').unsigned()
      builder.integer('user_agreement_id').unsigned()
      builder.integer('terms_of_use_id').unsigned()
      builder.dateTime('date_created', { useTz: true }).notNullable()
      builder.dateTime('date_agreement', { useTz: true })
      builder.dateTime('date_disagreement', { useTz: true })

      builder
        .foreign('user_id')
        .references('user.id')
        .onDelete('CASCADE')
        .withKeyName('fk_user_documents-user_id-user-id')
      builder
        .foreign('consent_id')
        .references('consent.id')
        .onDelete('CASCADE')
        .withKeyName('fk_user_documents-consent_id-consent-id')
      builder
        .foreign('personal_data_policy_id')
        .references('personal_data_policy.id')
        .onDelete('CASCADE')
        .withKeyName('fk_user_documents-personal_data_policy_id-personal_data_policy-id')
      builder
        .foreign('privacy_policy_id')
        .references('privacy_policy.id')
        .onDelete('CASCADE')
        .withKeyName('fk_user_documents-privacy_policy_id-privacy_policy-id')
      builder
        .foreign('user_agreement_id')
        .references('user_agreement.id')
        .onDelete('CASCADE')
        .withKeyName('fk_user_documents-user_agreement_id-user_agreement-id')
      builder
        .foreign('terms_of_use_id')
        .references('terms_of_use.id')
        .onDelete('CASCADE')
        .withKeyName('fk_user_documents-terms_of_use_id-terms_of_use-id')
    })

    await knex('consent').insert({
      version: 'v1.0',
      date_created: dayjs().toDate(),
      date_published: dayjs('2026-03-12T00:00:00+00:00').toDate()
    })
    console.log('consent (v1.0) is created')

    await knex('personal_data_policy').insert({
      version: 'v1.0',
      date_created: dayjs().toDate(),
      date_published: dayjs('2026-03-26T00:00:00+00:00').toDate()
    })
    console.log('personal_data_policy (v1.0) is created')

    await knex('privacy_policy').insert({
      version: 'v1.0',
      date_created: dayjs().toDate(),
      date_published: dayjs('2026-03-12T00:00:00+00:00').toDate()
    })
    console.log('privacy_policy (v1.0) is created')

    await knex('user_agreement').insert({
      version: 'v1.0',
      date_created: dayjs().toDate(),
      date_published: dayjs('2026-03-12T00:00:00+00:00').toDate()
    })
    console.log('user_agreement (v1.0) is created')

    await knex('terms_of_use').insert({
      version: 'v1.0',
      date_created: dayjs().toDate(),
      date_published: dayjs('2026-03-12T00:00:00+00:00').toDate()
    })
    console.log('terms_of_use (v1.0) is created')

    const users = await knex('user')

    for (const user of users) {
      await knex('user_documents').insert({
        user_id: user.id,
        consent_id: 1,
        personal_data_policy_id: 1,
        privacy_policy_id: 1,
        user_agreement_id: 1,
        terms_of_use_id: 1,
        date_created: dayjs().toDate(),
        date_agreement: dayjs().toDate()
      })
    }
  }

  public async down(): Promise<void> {
    const knex = this.ctx ?? this.driver.getConnection('write').getKnex()

    await knex.schema.dropTable('user_documents')
    await knex.schema.dropTable('consent')
    await knex.schema.dropTable('personal_data_policy')
    await knex.schema.dropTable('privacy_policy')
    await knex.schema.dropTable('user_agreement')
    await knex.schema.dropTable('terms_of_use')
  }
}
