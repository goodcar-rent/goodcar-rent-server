import KnexStorage from './storage-knex'
import Knex from 'knex'

export default (app) => {
  const knexStorage = KnexStorage(app)

  if (!app.env.KNEX_STORAGE_URL) {
    throw new Error('storage-knex-sqlie expect to have env.KNEX_STORAGE_URL')
  }

  const aStorage = {
    db: null,
    name: 'KNEX-SQLite',
    modelFromSchema: knexStorage.modelFromSchema,
    mapPropToKnexTable: (prop, table) => {
      switch (prop.type) {
        case 'id':
          table.string(prop.name, 36)
          break
        case 'email':
          table.string(prop.name)
          break
        case 'text':
          table.string(prop.name, prop.size || 256)
          break
        case 'password':
          table.string(prop.name)
          break
        case 'ref':
          table.string(prop.name, 36)
          break
        case 'refs':
          table.string(prop.name, prop.size || 256)
          break
        case 'array':
          table.string(prop.name, prop.size || 2048)
          break
        case 'datetime':
          table.datetime(prop.name)
          break
        case 'boolean':
          table.boolean(prop.name)
          break
        case 'enum':
          table.integer(prop.name, 1)
          break
        case 'decimal':
          table.decimal(prop.name, prop.precision || 8, prop.scale || 2)
          break
        case 'float':
          table.float(prop.name, prop.precision || 8, prop.scale || 2)
          break
        case 'calculated':
          break
        default:
          throw new Error(`invalid prop.type ${prop.type} for ${prop.name}`)
      }
    },

    storageInit: () => {
      // console.log('KNEX driver')
      let debug = false
      if (process.env.NODE_ENV === 'test' || process.env.DEBUG) debug = false
      return Promise.resolve()
        .then(() => Knex(
          {
            client: 'sqlite3',
            connection: {
              filename: app.env.KNEX_STORAGE_URL
            },
            migrations: {
              tableName: 'knex_migrations',
              directory: './data/migrations'
            },
            seeds: {
              directory: './data/seeds'
            },
            useNullAsDefault: true,
            debug
          }
        ))
        .then((db) => {
          aStorage.db = db
          return app
        })
        .catch((err) => { throw err })
    },

    storageClose: () => {
      // console.log('KNEX - close')
      return Promise.resolve()
        .then(() => aStorage.db.migrate.latest())
        .then(() => {
          aStorage.db.destroy()
          aStorage.db = null
        })
    },
    schemaInit: knexStorage.schemaInit,
    schemaClear: knexStorage.schemaClear,

    dataInit: knexStorage.dataInit,
    dataClear: knexStorage.dataClear,

    refsInit: knexStorage.refsInit,
    refsClear: knexStorage.refsClear,

    findById: knexStorage.findById,
    findOne: knexStorage.findOne,
    findAll: knexStorage.findAll,
    count: knexStorage.count,
    removeById: knexStorage.removeById,
    removeAll: knexStorage.removeAll,
    create: knexStorage.create,
    update: knexStorage.update,
    refAdd: knexStorage.refAdd,
    refRemove: knexStorage.refRemove,
    refList: knexStorage.refList,
    refClear: knexStorage.refClear,
    refCount: knexStorage.refCount
  }

  return aStorage
}
