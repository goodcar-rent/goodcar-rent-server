import SQL from 'sql-template-strings/index'
import _ from 'lodash'
import sqlite from 'sqlite'
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
        .then(() => sqlite.open(app.storage.storageLocation, { Promise }))
        .then((db) => {
          app.storage.db = db
          return app
        })
        .catch((err) => { throw err })
    },

    closeStorage: () => {
      return app.storage.db.close()
        .then(() => {
          app.storage.db = null
        })
        .catch((err) => { throw err })
    },

    init: (Model) => (id) => {
      const query = SQL`CREATE TABLE IF NOT EXISTS `
        .append(Model.name)

      let delim = '('
      Model.props.map((prop) => {
        if (prop.type === 'id') {
          query.append(delim)
            .append(prop.name)
            .append(SQL` TEXT PRIMARY KEY`)
          delim = ','
        } else if (prop.type === 'email') {
          query.append(delim)
            .append(prop.name)
            .append(SQL` TEXT`)
          delim = ','
        } else if (prop.type === 'text') {
          query.append(delim)
            .append(prop.name)
            .append(SQL` TEXT`)
          delim = ','
        } else if (prop.type === 'password') {
          query.append(delim)
            .append(prop.name)
            .append(SQL` TEXT`)
          delim = ','
        } else if (prop.type === 'ref') {
          query.append(delim)
            .append(prop.name)
            .append(SQL` TEXT`)
          delim = ','
        } else if (prop.type === 'refs') {
          query.append(delim)
            .append(prop.name)
            .append(SQL` TEXT`)
          delim = ','
        } else if (prop.type === 'datetime') {
          query.append(delim)
            .append(prop.name)
            .append(SQL` INTEGER`)
          delim = ','
        } else if (prop.type === 'boolean') {
          query.append(delim)
            .append(prop.name)
            .append(SQL` INTEGER`)
          delim = ','
        }
      })
      query.append(');')
      return Model.app.storage.db.run(query)
      // .then(() => {
      //   const query = SQL`DELETE FROM `
      //     .append(Model.name)
      //   return Model.app.storage.db.run(query)
      // })
    },

    findById: (Model) => (id) => {
      const query = SQL`SELECT * FROM `
        .append(Model.name)
        .append(SQL` WHERE id=${id};`)

      if (!Model || !Model.app || !Model.app.storage || !Model.app.storage.db) {
        return Promise.reject(new Error(`${Model.name}.genericFindById: some Model's properties are invalid: Model ${Model}, .app ${Model.app} .storage${Model.app.storage} .db ${Model.app.storage.db}`))
      }
      return Model.app.storage.db.get(query)
        .then((res) => {
          if (!res) return res
          return Model.processGetProps(res)
        })
        .catch((err) => { throw err })
    },

    findOne: (Model) => (opt) => {
      const aKeys = Object.keys(opt.where)
      const aValues = Object.values(opt.where)

      const query = SQL`SELECT * FROM `.append(Model.name)

      let delim = ' WHERE '
      aKeys.map((key, ndx) => {
        query.append(delim)
        delim = ' AND '
        query.append(key).append(SQL`=${aValues[ndx]}`)
      })
      query.append(' LIMIT 1;')

      return Model.app.storage.db.get(query)
        .then((res) => Model.processGetProps(res))
        .catch((err) => { throw err })
    },

    findAll: (Model) => (opt) => {
      // console.log('findAll - opt')
      // console.log(opt)
      let aKeys = []
      let aValues = []
      if (opt && opt.where) {
        aKeys = Object.keys(opt.where)
        aValues = Object.values(opt.where)
      }

      const query = SQL`SELECT * FROM `.append(Model.name)

      let delim = ' WHERE '
      aKeys.map((key, ndx) => {
        query.append(delim)
        delim = ' AND '
        query.append(key).append(SQL`=${aValues[ndx]}`)
      })
      query.append(';')

      return Model.app.storage.db.all(query)
        .then((res) => {
          // console.log('all:')
          // console.log(res)
          return res.map((item) => Model.processGetProps(item))
        })
        .catch((err) => { throw err })
    },

    count: (Model) => () => {
      const query = SQL`SELECT count(*) FROM `.append(Model.name)
      return Model.app.storage.db.get(query)
        .then((res) => Object.values(res)[0])
        .catch((err) => { throw err })
    },

    removeById: (Model) => (id) => {
      const query = SQL`SELECT * FROM `.append(Model.name).append(SQL` WHERE id=${id}`)
      return Model.app.storage.db.get(query)
        .then((res) => {
          if (!res) {
            throw new Error(`${Model.name}.genericDelete: user with id ${id} not found`)
          }
          const aQuery = SQL`DELETE FROM `.append(Model.name).append(SQL` WHERE id=${id};`)
          return Promise.all([res, Model.app.storage.db.run(aQuery)])
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

    clearData: (Model) => () => Model.app.storage.db.run(SQL`DELETE FROM `.append(Model.name)),

    create: (Model) => (item) => {
      // process props with hooks (default value / beforeSet
      // console.log(`--\n${Model.name}.genericCreate(${JSON.stringify(item)})\n`)
      let aNames = ''
      let delim = '('

      const aItem = Model.processDefaults(item)
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

        aNames = aNames + delim + prop.name
        delim = ','
      })
      if (aNames.length > 0) {
        aNames = aNames + ')'
      }

      // build query:
      const query = SQL`INSERT INTO `.append(Model.name).append(aNames).append(' VALUES (')
      delim = ''
      aKeys.map((key) => {
        query.append(delim).append(SQL`${aItem[key]}`)
        delim = ','
      })
      query.append(');')

      // console.log(`\nQuery prepared:\nSQL:${JSON.stringify(query.sql)}\nValues:${JSON.stringify(query.values)}`)
      return Model.app.storage.db.run(query)
        .then(() => Model.findById(aItem.id))
        .then((res) => {
          // console.log(`created item: ${JSON.stringify(res)}`)
          return res
        })
        .catch((err) => {
          // console.log(`--\nError: ${JSON.stringify(err)}`)
          throw err
        })
    },

    update: (Model) => (item) => {
      if (!item.id) {
        return Promise.reject(new Error(`${Model.name}.genericUpdate: item.id should have proper value`))
      }

      const aKeys = Object.keys(item)
      const aItem = Model.processDefaults(item)
      const aId = _.find(Model.props, { type: 'id' })
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
      const query = SQL`UPDATE `.append(Model.name).append(SQL` SET `)
      let delim = ''

      aKeys.map((key) => {
        query.append(delim).append(key).append(SQL`=${aItem[key]}`)
        delim = ','
      })
      query.append(SQL` WHERE `.append(aId.name).append(SQL` = ${item.id}`))

      return Model.app.storage.db.run(query)
        .then(() => Model.findById(item.id))
        .catch((err) => { throw err })
    }
  }
}
