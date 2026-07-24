import { AnyEntity, EntityManager } from '@mikro-orm/core'
import { AbstractSqlConnection, Knex } from '@mikro-orm/postgresql'

export function useKnex(em: EntityManager): Knex<any, any> {
	const knex = (em.getConnection() as AbstractSqlConnection).getKnex()
	knex.on('query', (queryData => {
		console.log(queryData.sql)
	}))

	return knex
}

export function getTableName(em: EntityManager, entity: AnyEntity) {
	return em.getMetadata().get(entity.name).tableName
}
