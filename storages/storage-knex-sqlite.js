import SQL from 'sql-template-strings/index'
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
      return Promise.resolve()
        .then(() => Knex(
          {
            client: 'sqlite3',
            connection: {
              filename: app.storage.storageLocation
            }
          }
        ))
        .then((db) => {
          app.storage.db = db
          return app
        })
        .catch((err) => { throw err })
    },

    init: (Model) => (id) => {
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
          if (exists) return

          knex.schema.createTable(Model.name, (table) => {
            Model.props.map((prop) => {
              switch (prop.type) {
                case 'id':
                  table.increments(prop.name)
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
                  table.uuid(prop.name)
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
                default:
                  throw new Error(`${Model.name}.init: invalid prop.type ${prop.type} for ${prop.name}`)
              }
            })
          })
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

      knex.select()
        .from(Model.name)
        .where(Model.key, id)
        .then((res) => Model.processGetProps(res))
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

      knex.select()
        .from(Model.name)
        .where(opt ? opt.where : {})
        .limit(1)
        .then((res) => Model.processGetProps(res))
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

      knex.select()
        .from(Model.name)
        .where(opt ? opt.where : {})
        .then((res) => Model.processGetProps(res))
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
        .then((res) => Object.values(res)[0])
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
      return knex(Model.name)
        .select()
        .where(Model.key, id)
        .then((res) => {
          if (!res) {
            throw new Error(`${Model.name}.removeById: record with id ${id} not found`)
          }
          return Promise.all([res, knex(Model.name).del().where(Model.key, id)])
        })
        .then((values) => {
          return values[0] // res
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
      knex(Model.name)
        .where(Model.key, item.id)
        .update(aItem)
        .then(() => Model.findById(item.id))
        .catch((err) => { throw err })
    }
  }
}
