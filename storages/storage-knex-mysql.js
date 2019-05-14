import _ from 'lodash'
import Knex from 'knex'
import { processDefaults, processGetProps } from './process-props'

export default (app) => {
  return {
    props: {},
    name: 'Undefined',
    storageLocation: 'Undefined',

    processDefaults,
    processGetProps,

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
          }
          return Promise.resolve(exists)
        })
        .then(() =>
          knex.schema.createTable(Model.name, (table) => {
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
                  table.string(prop.name,255)
                  break
                case 'datetime':
                  table.dateTime(prop.name)
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
        )
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
        .then((res) => Model.processGetProps(res[0]))
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
        .then((res) => Model.processGetProps(res[0]))
        .catch((err) => { throw err })
    },

    findAll: (Model) => (opt) => {
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
        .where(opt ? opt.where : {})
        .then((res) => res.map((item) => Model.processGetProps(item)))
        .catch((err) => { throw err })
    },

    count: (Model) => () => {
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
        .catch((err) => { throw err })
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
      return Model.findAll(opt)
        .then((res) => {
          if (res) {
            return Promise.all(res.map((item) => Model.removeById(item.id)))
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
      const aItem = Model.processDefaults(item)

      // console.log(`--\n${Model.name}.genericCreate(${JSON.stringify(item)})\n`)

      // process props with hooks (default value / beforeSet
      const aKeys = Object.keys(aItem)
      aKeys.map((key) => {
        // copy property to proxy object
        const prop = _.find(Model.props, { name: key })
        if (!prop) {
          throw new Error(`${Model.name}.genericCreate: property "${key}" is not defined in model`)
        }

        if (prop.beforeSet && (typeof prop.beforeSet === 'function')) {
          aItem[key] = prop.beforeSet(aItem)
        }

        // replace boolean values with number:
        if (prop.type === 'boolean') {
          aItem[key] = item[key] ? 1 : 0
        }

        // replace refs array with string representation
        if (prop.type === 'refs') {
          if (!item[key] || item[key] === []) {
            aItem[key] = ''
          } else {
            aItem[key] = item[key].join(',')
          }
        }
      })

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

      const aKeys = Object.keys(item)
      const aItem = Model.processDefaults(item)
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

      // process all props in item:
      return knex(Model.name)
        .where(Model.key, item.id)
        .update(aItem)
        .then(() => Model.findById(item.id))
        .catch((err) => { throw err })
    }
  }
}
