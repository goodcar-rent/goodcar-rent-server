import _ from 'lodash'
import fs from 'fs'
import moment from 'moment'
import { isPromise } from './is-promise'

export const checkIsFullVirtual = (Model) => {
  // check if model have only calculated fields
  let allCalculated = true
  Model.props.map((prop) => {
    if (!(prop.calculated && prop.calculated === true)) {
      allCalculated = false
    }
  })
  return allCalculated
}

export const processBeforeSaveToStorage = (Model, item, opts) => {
  // console.log(`processBeforeSaveToStorage(${Model.name}, ${JSON.stringify(item)})\n`)
  const aItem = _.merge({}, item)
  opts = opts || { defaults: true }

  // check if all keys are defined in model
  const aKeys = Object.keys(aItem)
  aKeys.map((key) => {
    // copy property to proxy object
    const prop = _.find(Model.props, { name: key })
    if (!prop) {
      throw new Error(`${Model.name}.processBeforeSaveToStorage: property "${key}" is not defined in model`)
    }
  })

  // process all default props if they are not defined in item:
  Model.props.map((prop) => {
    if (opts.defaults && prop.default && (!item[prop.name] || item[prop.name] === null || item[prop.name] === undefined)) {
      if (typeof prop.default === 'function') {
        aItem[prop.name] = prop.default(aItem)
      } else {
        aItem[prop.name] = prop.default
      }
    }
    if (prop.beforeSave && item[prop.name] && (typeof prop.beforeSave === 'function')) {
      // console.log(prop.beforeSave.toString())
      // console.log(aItem)
      aItem[prop.name] = prop.beforeSave(aItem)
    }
    if (prop.type === 'boolean') {
      aItem[prop.name] = item[prop.name] ? 1 : 0
    }
    if (prop.type === 'id') {
      Model.key = prop.name
    }
    if (item[prop.name] && prop.type === 'datetime') {
      aItem[prop.name] = moment.utc(item[prop.name]).toDate()
    }
    if (prop.type === 'enum') {
      // ensure enum values are in range:
      if (!_.find(prop.format, { value: item[prop.name] })) {
        throw Error(`${Model.name}.${prop.name} enum value invalid: not found in enum format definition`)
      }
    }
    if (prop.calculated) {
      delete aItem[prop.name]
    }

    // replace refs array with string representation
    if (prop.type === 'refs') {
      if (!item[prop.name] || item[prop.name] === [] || item[prop.name] === '') {
        aItem[prop.name] = null
      } else if (Array.isArray(item[prop.name])) {
        aItem[prop.name] = item[prop.name].join(',')
      }
    }
  })
  // console.log(`processBeforeSaveToStorage result:\n${JSON.stringify(aItem)}`)
  return aItem
}

export const processAfterLoadFromStorageAsync = (Model, item) => {
  const aItem = processAfterLoadFromStorage(Model, item)
  const values = []
  const props = []
  Model.props.map((prop) => {
    if (prop.calculated && aItem[prop.name] && isPromise(aItem[prop.name])) {
      props.push(prop)
      values.push(aItem[prop.name])
    }
  })
  return Promise.all(values)
    .then((_props) => {
      _props.map((_prop, index) => {
        aItem[props[index].name] = _prop
      })
      return aItem
    }, (reason) => {
      throw new Error(reason)
    })
    .catch((e) => { throw e })
}

// transform some item using rules from Model:l
export const processAfterLoadFromStorage = (Model, item) => {
  // console.log(`\nprocessGetProps(${Model.name}, ${JSON.stringify(item)}\n`)
  // if item is not defined, return null
  if (!item) {
    return item
  }

  const aItem = _.merge({}, item)

  const aKeys = Object.keys(aItem)
  const propKeys = Model.props.map((prop) => prop.name)
  if ((_.difference(aKeys, propKeys)).length > 0) {
    console.log('arrays are not same:')
    console.log(aKeys)
    console.log(propKeys)
  }
  // const getters = []
  propKeys.map((key) => {
    const prop = _.find(Model.props, { name: key })
    if (!prop) {
      throw new Error(`${Model.name}.processAfterLoadFromStorage: Model "${Model.name}" does not have definition for property "${key}"`)
    }
    aItem[key] = item[key]

    if ((prop.default || prop.default !== undefined || prop.default !== null) &&
      (!item[prop.name] || item[prop.name] === null || item[prop.name] === undefined)) {
      if (typeof prop.default === 'function') {
        aItem[prop.name] = prop.default(aItem)
      } else {
        aItem[prop.name] = prop.default
      }
    }

    if (item[key] && prop.type === 'boolean') {
      aItem[key] = (!!item[key])
    }
    if (item[key] && prop.type === 'enum') {
      // check loaded value for enum field:
      const format = _.find(prop.format, { value: item[key] })
      if (!format) {
        throw Error(`${Model.name}.${prop.name} enum value invalid: not found in enum format definition; value = ${item[key]}`)
      }
      // set enum caption for field
      // aItem[`${key}_caption`] = format.caption
    }
    if (prop.type === 'refs') {
      // console.log('refs prop')
      if (!item[key]) {
        aItem[key] = []
      } else if (item[key].length > 0) {
        aItem[key] = item[key].split(',')
        if (!Array.isArray(aItem[key])) {
          aItem[key] = [aItem[key]]
        }
      } else {
        aItem[key] = []
      }
    }
    if (item[key] && prop.type === 'datetime') {
      aItem[key] = moment.utc(item[key]).toDate()
    }
    /* if (prop.type === 'calculated') {
      if (prop.getter && (typeof prop.getter === 'function')) {
        getters.push({ name: prop.name, getter: prop.getter })
      }
    } */
  })

  // process all after-load getters:
  Model.props.map((prop) => {
    if (prop.calculated && prop.getter && (typeof prop.getter === 'function')) {
      aItem[prop.name] = prop.getter(aItem)
    }
    if (prop.afterLoad && (typeof prop.afterLoad === 'function')) {
      aItem[prop.name] = prop.afterLoad(aItem)
    }
  })

  // after processing all props process getters on final property values:
  // getters.map((getter) => { aItem[getter.name] = getter.getter(aItem) })

  // console.log(`processAfterLoadFromStorage result:\n${JSON.stringify(aItem)}`)
  return aItem
}

const withWhere = (queryBuilder, opt) => {
  if (opt && opt.where) {
    queryBuilder.where(opt.where)
  }
}

const withWhereIn = (queryBuilder, opt) => {
  if (opt && opt.whereIn) {
    let op = opt.whereIn
    if (!Array.isArray(opt.whereIn)) {
      op = [opt.whereIn]
    }
    op.map((item) => {
      if (item.column && item.ids) {
        queryBuilder.whereIn(item.column, item.ids)
      }
    })
  }
}

const withWhereOp = (queryBuilder, opt) => {
  if (opt && opt.whereOp) {
    let op = opt.whereOp
    if (!Array.isArray(op)) {
      op = [opt.whereOp]
    }
    op.map((item) => {
      if (item.column && item.op && item.value) {
        queryBuilder.andWhere(item.column, item.op, item.value)
      }
    })
  }
}

const withWhereQ = (queryBuilder, opt) => {
  if (opt && opt.whereQ) {
    let op = opt.whereQ
    if (!Array.isArray(op)) {
      op = [opt.whereQ]
    }
    queryBuilder.andWhere((qb) => {
      op.map((item) => {
        if (item.column && item.op && item.value) {
          qb.orWhere(item.column, item.op, item.value)
        }
      })
    })
  }
}

const withOrderBy = (queryBuilder, opt) => {
  if (opt && opt.orderBy) {
    let op = opt.orderBy
    if (!Array.isArray(op)) {
      op = [opt.orderBy]
    }
    queryBuilder.orderBy(op)
  }
}

const withRange = (queryBuilder, opt) => {
  if (opt && opt.range) {
    let op = opt.range
    if (!Array.isArray(op)) {
      op = [opt.range]
    }
    // console.log('range')
    // console.log(`[${op[0]}, lim ${op[1] - op[0] + 1}]`)
    queryBuilder.offset(op[0]).limit(op[1] - op[0] + 1)
  }
}

export default (app) => {
  const aStorage = {
    db: {},
    props: {},
    name: 'KNEX-Generic',

    modelFromSchema: (Model) => {
      const modelMethods = []

      modelMethods.push({ name: 'dataInit', handler: Model.storage.dataInit(Model) })
      modelMethods.push({ name: 'dataClear', handler: Model.storage.dataClear(Model) })
      modelMethods.push({ name: 'schemaInit', handler: Model.storage.schemaInit(Model) })
      modelMethods.push({ name: 'schemaClear', handler: Model.storage.schemaClear(Model) })
      modelMethods.push({ name: 'refsInit', handler: Model.storage.refsInit(Model) })
      modelMethods.push({ name: 'refsClear', handler: Model.storage.refsClear(Model) })
      if (!checkIsFullVirtual(Model)) {
        // process refs:
        const refsProps = _.filter(Model.props, { type: 'refs' })
        refsProps.map((prop) => {
          const methodAdd = `${prop.name}Add`
          const methodRemove = `${prop.name}Remove`
          const methodClear = `${prop.name}Clear`
          const methodCount = `${prop.name}Count`
          const methodList = `${prop.name}List`

          // define methods:
          modelMethods.push({ name: methodAdd, handler: Model.storage.refAdd(Model, prop) })
          modelMethods.push({ name: methodRemove, handler: Model.storage.refRemove(Model, prop) })
          modelMethods.push({ name: methodClear, handler: Model.storage.refClear(Model, prop) })
          modelMethods.push({ name: methodCount, handler: Model.storage.refCount(Model, prop) })
          modelMethods.push({ name: methodList, handler: Model.storage.refList(Model, prop) })
        })

        modelMethods.push({ name: 'findById', handler: Model.storage.findById(Model) })
        modelMethods.push({ name: 'findOne', handler: Model.storage.findOne(Model) })
        modelMethods.push({ name: 'findAll', handler: Model.storage.findAll(Model) })
        modelMethods.push({ name: 'count', handler: Model.storage.count(Model) })
        modelMethods.push({ name: 'removeById', handler: Model.storage.removeById(Model) })
        modelMethods.push({ name: 'removeAll', handler: Model.storage.removeAll(Model) })
        modelMethods.push({ name: 'create', handler: Model.storage.create(Model) })
        modelMethods.push({ name: 'update', handler: Model.storage.update(Model) })
      }

      modelMethods.map((method) => {
        if (!Model[method.name]) {
          Model[method.name] = method.handler
        }
      })
      return Model
    },

    mapPropToKnexTable: (prop, table) => {
      return table.string(prop.name)
    },

    storageInit: () => {
      return Promise.resolve()
    },

    storageClose: () => {
      return Promise.resolve()
    },

    schemaInit: (Model) => (id) => {
      // console.log(`${Model.name}.init`)
      if (checkIsFullVirtual(Model) === true) {
        return Promise.resolve(true)
      }

      if (!Model || !Model.storage || !Model.storage.db) {
        return Promise.reject(new Error(`${Model.name}.storageSchemaInit: some Model's properties are invalid:
          Model ${Model},
          .storage${Model.storage}
          .db ${Model.storage.db}`))
      }

      const knex = Model.storage.db
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
                Model.storage.mapPropToKnexTable(prop, table)
              })
            })
          } else {
            return knex(Model.name).columnInfo()
              .then((info) => {
                // check if all model's properties are in info:
                const infoKeys = Object.keys(info)
                const diff = _.differenceWith(Model.props, infoKeys, (prop, infoKey) => {
                  if (!prop || !infoKey) {
                    return false
                  }
                  if (prop.calculated) {
                    return true
                  }
                  if (prop.name === infoKey) {
                    return true
                  }
                  return false
                })
                if (diff.length > 0) {
                  console.log(`${Model.name}.diff:`)
                  console.log(JSON.stringify(diff))
                  throw Error(`Database outdated for "${Model.name}" for columns: ${JSON.stringify(diff)}`)
                }
              })
              .catch((e) => { throw e })
          }
        })
        .catch((e) => { throw e })
    },

    schemaClear: (Model) => () => {
      if (!Model || !Model.storage || !Model.storage.db) {
        return Promise.reject(new Error(`${Model.name}.storageSchemaClear: some Model's properties are invalid:
          Model ${Model},
          .storage${Model.storage}
          .db ${Model.storage.db}`))
      }
      const knex = Model.storage.db

      return knex.schema.hasTable(Model.name)
        .then((exists) => {
          if (exists) {
            return knex.schema.dropTable(Model.name)
          }
          return Promise.resolve(false)
        })
    },

    dataInit: (Model) => (seedFileName) => {
      if (!Model || !Model.storage || !Model.storage.db) {
        return Promise.reject(new Error(`${Model.name}.dataInit: some Model's properties are invalid:
          Model ${Model},
          .storage ${Model.storage}
          .db ${Model.storage.db}`))
      }
      const knex = Model.storage.db
      const seedData = JSON.parse(fs.readFileSync(seedFileName))

      const tasks = seedData.map((item) => knex(Model.name).insert(item))
      return Promise.all(tasks)
        .catch((err) => { throw err })
    },

    dataClear: (Model) => () => {
      if (!Model || !Model.storage || !Model.storage.db) {
        return Promise.reject(new Error(`${Model.name}.dataClear: some Model's properties are invalid:
          Model ${Model},
          .storage ${Model.storage}
          .db ${Model.storage.db}`))
      }

      // check if model have only calculated fields
      let allCalculated = true
      Model.props.map((prop) => {
        if (!(prop.calculated && prop.calculated === true)) {
          allCalculated = false
        }
      })

      if (allCalculated === true) {
        return Promise.resolve(true)
      }

      const knex = Model.storage.db
      return knex(Model.name).del()
        .catch((err) => { throw err })
    },

    refsInit: (Model) => () => {},
    refsClear: (Model) => () => {},

    findById: (Model) => (id) => {
      if (!Model || !Model.storage || !Model.storage.db) {
        return Promise.reject(new Error(`${Model.name}.findById: some Model's properties are invalid:
          Model ${Model},
          .storage ${Model.storage}
          .db ${Model.storage.db}`))
      }
      const knex = Model.storage.db

      return knex.select()
        .from(Model.name)
        .where(Model.key, id)
        .then((res) => processAfterLoadFromStorageAsync(Model, res[0]))
        .catch((err) => { throw err })
    },

    findOne: (Model) => (opt) => {
      if (!Model || !Model.storage || !Model.storage.db) {
        return Promise.reject(new Error(`${Model.name}.findOne: some Model's properties are invalid:
          Model ${Model},
          .storage ${Model.storage}
          .db ${Model.storage.db}`))
      }
      const knex = Model.storage.db

      // if (opt) {
      //   console.log('opt:')
      //   console.log(opt)
      // }
      return knex.select()
        .from(Model.name)
        .modify(withWhere, opt)
        .modify(withWhereIn, opt)
        .modify(withWhereOp, opt)
        .modify(withWhereQ, opt)
        .modify(withOrderBy, opt)
        .modify(withRange, opt)
        .limit(1)
        .then((res) => processAfterLoadFromStorageAsync(Model, res[0]))
        .catch((err) => { throw err })
    },

    findAll: (Model) => (opt) => {
      // console.log('storage.findAll:')
      // console.log(opt)
      if (!Model || !Model.storage || !Model.storage.db) {
        return Promise.reject(new Error(`${Model.name}.findAll: some Model's properties are invalid:
          Model ${Model},
          .storage ${Model.storage}
          .db ${Model.storage.db}`))
      }
      const knex = Model.storage.db

      // if (opt) {
      //   console.log('opt:')
      //   console.log(opt)
      // }

      return knex.select()
        .from(Model.name)
        .where((opt && opt.where) ? opt.where : {})
        .modify(withWhereIn, opt)
        .modify(withWhereOp, opt)
        .modify(withWhereQ, opt)
        .modify(withOrderBy, opt)
        .modify(withRange, opt)
        .then((res) => Promise.all(res.map((item) => processAfterLoadFromStorageAsync(Model, item))))
        .then((res) => {
          // console.log('res:')
          // console.log(res)
          return Promise.resolve(res)
        })
        .catch((err) => {
          // console.log('error:')
          // console.log(err)
          throw err
        })
    },

    count: (Model) => () => {
      // console.log('storage.count')
      if (!Model || !Model.storage || !Model.storage.db) {
        throw Error(`${Model.name}.count: some Model's properties are invalid:
          Model ${Model},
          .storage ${Model.storage}
          .db ${Model.storage.db}`)
      }
      const knex = Model.storage.db
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
          // console.log('error:')
          // console.log(err)
          throw err
        })
    },

    removeById: (Model) => (id) => {
      if (!Model || !Model.storage || !Model.storage.db) {
        return Promise.reject(new Error(`${Model.name}.removeById: some Model's properties are invalid:
          Model ${Model},
          .storage ${Model.storage}
          .db ${Model.storage.db}`))
      }
      const knex = Model.storage.db
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
                // .then((removedItem) => removedItem.id)
                .catch((err) => { throw err })
            }))
          }
          return null
        })
        .catch((err) => { throw err })
    },

    create: (Model) => (item) => {
      if (!Model || !Model.storage || !Model.storage.db) {
        return Promise.reject(new Error(`${Model.name}.create: some Model's properties are invalid:
          Model ${Model},
          .storage ${Model.storage}
          .db ${Model.storage.db}`))
      }
      const knex = Model.storage.db
      const aItem = processBeforeSaveToStorage(Model, item)

      // build query:
      return knex(Model.name)
        .insert(aItem)
        .then(() => Model.findById(aItem.id))
        .catch((err) => {
          // console.log(`--\nError: ${JSON.stringify(err)}`)
          throw err
        })
    },

    update: (Model) => (aId, item) => {
      if (!aId) {
        return Promise.reject(new Error(`${Model.name}.update: aId param should have value`))
      }
      if (!Model || !Model.storage || !Model.storage.db) {
        return Promise.reject(new Error(`${Model.name}.update: some Model's properties are invalid:
          Model ${Model},
          .storage ${Model.storage}
          .db ${Model.storage.db}`))
      }
      const knex = Model.storage.db

      // console.log('item:')
      // console.log(item)
      // const aKeys = Object.keys(item)
      const aItem = processBeforeSaveToStorage(Model, item, { defaults: false })
      // console.log('aItem:')
      // console.log(aItem)
      // process all item's props
      /* aKeys.map((key) => {
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
      }) */

      // console.log('processed aItem:')
      // console.log(aItem)
      // process all props in item:
      return knex(Model.name)
        .where(Model.key, aId)
        .update(aItem)
        .then((res) => Model.findById(aItem.id ? aItem.id : aId))
        .catch((err) => { throw err })
    },

    refAdd: (Model, prop) => (id, items) => {
      if (!Array.isArray(items)) {
        items = [items]
      }
      return Model.findById(id)
        .then((item) => {
          if (!item) {
            throw new Error(`${Model.name}.${prop.name}Add: item with id ${id} not found`)
          }
          if (!Array.isArray(items)) {
            items = [items]
          }
          item[prop.name] = _.union(item[prop.name], items)
          return Model.update(id, item)
        })
        .catch((err) => { throw err })
    },

    refRemove: (Model, prop) => (id, items) => {
      if (!Array.isArray(items)) {
        items = [items]
      }
      return Model.findById(id)
        .then((item) => {
          if (!item) {
            throw new Error(`${Model.name}.${prop.name}Remove: item with id ${id} not found`)
          }
          _.pullAll(item[prop.name], items)
          return Model.update(id, item)
        })
        .catch((err) => { throw err })
    },

    refList: (Model, prop) => (id) => {
      return Model.findById(id)
        .then((item) => {
          if (!item) {
            throw new Error(`${Model.name}.${prop.name}Embed: item with id ${id} not found`)
          }
          const ids = item[prop.name]
          const RefModelName = prop.model
          if (!RefModelName) {
            throw new Error(`${Model.name}.${prop.name}Embed: model name for refs property ${prop.name} not defined`)
          }
          const RefModel = app.exModular.models[RefModelName]
          if (!RefModel) {
            throw new Error(`${Model.name}.${prop.name}Embed: model ${RefModelName} for refs property ${prop.name} not found`)
          }
          return RefModel.findAll({ whereIn: [{ column: 'id', ids }] })
        })
        .catch((err) => { throw err })
    },

    refClear: (Model, prop) => (id) => {
      return Model.findById(id)
        .then((item) => {
          if (!item) {
            throw new Error(`${Model.name}.${prop.name}Clear: item with id ${id} not found`)
          }
          item[prop.name] = []
          return Model.update(id, item)
        })
        .catch((err) => { throw err })
    },

    refCount: (Model, prop) => (id) => {
      return Model.findById(id)
        .then((item) => {
          if (!item) {
            throw new Error(`${Model.name}.${prop.name}Count: item with id ${id} not found`)
          }
          return item[prop.name].length
        })
        .catch((err) => { throw err })
    }
  }

  return aStorage
}
