import _ from 'lodash'
import Knex from 'knex'
import { processBeforeSaveToStorage, processAfterLoadFromStorage } from './process-props'

const withWhereIn = (queryBuilder, opt) => {
  if (opt && opt.whereIn && opt.whereIn.column && opt.whereIn.ids) {
    queryBuilder.whereIn(opt.whereIn.column, opt.whereIn.ids)
  }
}

export default (app) => {
  return {
    props: {},
    name: 'KNEX-MySQL',
    storageLocation: '',

    processBeforeSaveToStorage: processBeforeSaveToStorage,
    processAfterLoadFromStorage: processAfterLoadFromStorage,

    initStorage: () => {
      // console.log('KNEX driver')
      let debug = false
      if (process.env.NODE_ENV === 'test' || process.env.DEBUG) debug = false
      return Promise.resolve()
        .then(() => Knex(
          {
            client: 'mysql',
            connection: {
              host: process.env.APP_DB_PATH,
              port: process.env.APP_DB_PORT,
              user: process.env.APP_DB_USER,
              password: process.env.APP_DB_USER_PASSWORD,
              database: process.env.APP_DB
            },
            useNullAsDefault: true,
            debug
          }
        ))
        .then((db) => {
          app.storage.db = db
          app.storage.name = 'KNEX-MySQL'
          return app
        })
        .catch((err) => { throw err })
    },

    closeStorage: () => {
      // console.log('KNEX - close')
      return Promise.resolve()
        .then(() => app.storage.db.migrate.latest())
        .then(() => {
          app.storage.db.destroy()
          app.storage.db = null
        })
    },

    init: (Model) => (id) => {
      // console.log(`${Model.name}.init`)
      if (!Model || !Model.app || !Model.app.storage || !Model.app.storage.db) {
        return Promise.reject(new Error(`${Model.name}.init: some Model's properties are invalid: 
          Model ${Model}, 
          .app ${Model.app} 
          .storage${Model.app.storage} 
          .db ${Model.app.storage.db}`))
      }
      const knex = app.storage.db

      return knex.schema.hasTable(Model.name)
        .then((exists) => {
          if (exists && process.env.START_FRESH) {
            return knex.schema.dropTable(Model.name)
              .then(() => Promise.resolve(false))
          }

          return Promise.resolve(exists)
        })
        .then((exists) => {
          Model.props.map((prop) => {
            if (prop.type === 'id') {
              Model.key = prop.name
            }
          })
          if (!exists) {
            return knex.schema.createTable(Model.name, (table) => {
              Model.props.map((prop) => {
                switch (prop.type) {
                  case 'id':
                    table.string(prop.name, 36)
                    break
                  case 'email':
                    table.string(prop.name)
                    break
                  case 'text':
                    table.string(prop.name)
                    break
                  case 'password':
                    table.string(prop.name)
                    break
                  case 'ref':
                    table.string(prop.name, 36)
                    break
                  case 'refs':
                    table.string(prop.name, 255)
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
                  default:
                    throw new Error(`${Model.name}.init: invalid prop.type ${prop.type} for ${prop.name}`)
                }
              })
            })
          }
        })
    },

    findById: (Model) => (id) => {
      if (!Model || !Model.app || !Model.app.storage || !Model.app.storage.db) {
        return Promise.reject(new Error(`${Model.name}.findById: some Model's properties are invalid: 
          Model ${Model},
          .app ${Model.app}
          .storage ${Model.app.storage}
          .db ${Model.app.storage.db}`))
      }
      const knex = app.storage.db

      return knex.select()
        .from(Model.name)
        .where(Model.key, id)
        .then((res) => Model.processAfterLoadFromStorage(res[0]))
        .catch((err) => { throw err })
    },

    findOne: (Model) => (opt) => {
      if (!Model || !Model.app || !Model.app.storage || !Model.app.storage.db) {
        return Promise.reject(new Error(`${Model.name}.findOne: some Model's properties are invalid: 
          Model ${Model},
          .app ${Model.app}
          .storage ${Model.app.storage}
          .db ${Model.app.storage.db}`))
      }
      const knex = app.storage.db

      return knex.select()
        .from(Model.name)
        .where(opt ? opt.where : {})
        .limit(1)
        .then((res) => Model.processAfterLoadFromStorage(res[0]))
        .catch((err) => { throw err })
    },

    findAll: (Model) => (opt) => {
      // console.log('storage.findAll:')
      // console.log(opt)
      if (!Model || !Model.app || !Model.app.storage || !Model.app.storage.db) {
        return Promise.reject(new Error(`${Model.name}.findAll: some Model's properties are invalid: 
          Model ${Model},
          .app ${Model.app}
          .storage ${Model.app.storage}
          .db ${Model.app.storage.db}`))
      }
      const knex = app.storage.db

      return knex.select()
        .from(Model.name)
        .where((opt && opt.where) ? opt.where : {})
        .modify(withWhereIn, opt)
        .then((res) => res.map((item) => Model.processAfterLoadFromStorage(item)))
        .then((res) => {
          // console.log('res:')
          // console.log(res)
          return Promise.resolve(res)
        })
        .catch((err) => {
          console.log('error:')
          console.log(err)
          throw err
        })
    },

    count: (Model) => () => {
      // console.log('storage.count')
      if (!Model || !Model.app || !Model.app.storage || !Model.app.storage.db) {
        return Promise.reject(new Error(`${Model.name}.count: some Model's properties are invalid: 
          Model ${Model},
          .app ${Model.app}
          .storage ${Model.app.storage}
          .db ${Model.app.storage.db}`))
      }
      const knex = app.storage.db
      return knex(Model.name)
        .count()
        .then((res) => {
          if (!res) return 0
          const count = res[0]
          return ((Object.values(count))[0])
        })
        .then((res) => {
          // console.log('res:')
          // console.log(res)
          return Promise.resolve(res)
        })
        .catch((err) => {
          console.log('error:')
          console.log(err)
          throw err
        })
    },

    removeById: (Model) => (id) => {
      if (!Model || !Model.app || !Model.app.storage || !Model.app.storage.db) {
        return Promise.reject(new Error(`${Model.name}.removeById: some Model's properties are invalid: 
          Model ${Model},
          .app ${Model.app}
          .storage ${Model.app.storage}
          .db ${Model.app.storage.db}`))
      }
      const knex = app.storage.db
      return Model.findById(id)
        .then((res) => {
          if (!res) {
            throw new Error(`${Model.name}.removeById: record with id ${id} not found`)
          }
          return Promise.all([res, knex(Model.name).del().where(Model.key, id)])
        })
        .then((res) => {
          return res[0] // res
        })
        .catch((err) => { throw err })
    },

    removeAll: (Model) => (opt) => {
      // console.log(`${Model.name}.removeAll: opt:`)
      // console.log(opt)
      return Model.findAll(opt)
        .then((res) => {
          // console.log('.findAll res:')
          // console.log(res)
          if (res) {
            return Promise.all(res.map((item) => {
              // console.log('item:')
              // console.log(item)
              return Model.removeById(item.id)
                .then((removedItem) => removedItem.id)
                .catch((err) => { throw err })
            }))
          }
          return null
        })
        .catch((err) => { throw err })
    },

    clearData: (Model) => () => {
      if (!Model || !Model.app || !Model.app.storage || !Model.app.storage.db) {
        return Promise.reject(new Error(`${Model.name}.clearData: some Model's properties are invalid: 
          Model ${Model},
          .app ${Model.app}
          .storage ${Model.app.storage}
          .db ${Model.app.storage.db}`))
      }
      const knex = app.storage.db
      return knex(Model.name).del()
        .catch((err) => { throw err })
    },

    create: (Model) => (item) => {
      if (!Model || !Model.app || !Model.app.storage || !Model.app.storage.db) {
        return Promise.reject(new Error(`${Model.name}.create: some Model's properties are invalid: 
          Model ${Model},
          .app ${Model.app}
          .storage ${Model.app.storage}
          .db ${Model.app.storage.db}`))
      }
      const knex = app.storage.db
      const aItem = Model.processBeforeSaveToStorage(item)

      // build query:
      return knex(Model.name)
        .insert(aItem)
        .then(() => Model.findById(aItem.id))
        .catch((err) => {
          // console.log(`--\nError: ${JSON.stringify(err)}`)
          throw err
        })
    },

    update: (Model) => (item) => {
      if (!item.id) {
        return Promise.reject(new Error(`${Model.name}.update: item.id should have proper value`))
      }
      if (!Model || !Model.app || !Model.app.storage || !Model.app.storage.db) {
        return Promise.reject(new Error(`${Model.name}.update: some Model's properties are invalid: 
          Model ${Model},
          .app ${Model.app}
          .storage ${Model.app.storage}
          .db ${Model.app.storage.db}`))
      }
      const knex = app.storage.db

      // console.log('item:')
      // console.log(item)
      const aKeys = Object.keys(item)
      const aItem = Model.processBeforeSaveToStorage(item)
      // console.log('aItem:')
      // console.log(aItem)
      // process all item's props
      aKeys.map((key) => {
        aItem[key] = item[key]

        // exec beforeSet hook:
        const aProp = _.find(Model.props, { name: key })
        if (aProp && aProp.beforeSet && (typeof aProp.beforeSet === 'function')) {
          aItem[key] = aProp.beforeSet(item)
        }
        // process booleans
        if (item[key] && aProp.type === 'boolean') {
          aItem[key] = item[key] ? 1 : 0
        }

        // process refs:
        if (item[key] && aProp.type === 'refs') {
          aItem[key] = item[key].join(',')
        }
      })

      // console.log('processed aItem:')
      // console.log(aItem)
      // process all props in item:
      return knex(Model.name)
        .where(Model.key, item.id)
        .update(aItem)
        .then(() => Model.findById(item.id))
        .catch((err) => { throw err })
    }
  }
}
