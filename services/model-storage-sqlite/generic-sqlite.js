import SQL from 'sql-template-strings'
import _ from 'lodash'

const processDefaults = (Model, item) => {
  console.log(`\nprocessDefaults(${Model.name}, ${JSON.stringify(item)})\n`)
  const aItem = _.merge({}, item)

  // process all default props if they are not defined in item:
  Model.props.map((prop) => {
    if (prop.default && !item[prop.name]) {
      if (typeof prop.default === 'function') {
        aItem[prop.name] = prop.default(aItem)
      } else {
        aItem[prop.name] = prop.default
      }
    }
  })
  console.log(`processDefaults result:\n${JSON.stringify(aItem)}`)
  return aItem
}

// transform some item using rules from Model:l
const processGetProps = (Model, item) => {
  console.log(`\nprocessGetProps(${Model.name}, ${JSON.stringify(item)}\n`)
  // if item is not defined, return null
  if (!item) {
    return item
  }

  const aItem = processDefaults(Model, item)

  const aKeys = Object.keys(aItem)
  aKeys.map((key) => {
    const prop = _.find(Model.props, { name: key })
    if (!prop) {
      throw new Error(`processGetProps: Model "${Model.name}" does not have definition for property "${key}"`)
    }
    aItem[key] = item[key]
    if (item[key] && prop.type === 'boolean') {
      aItem[key] = (!!item[key])
    }
    if (prop.type === 'refs') {
      // console.log('refs prop')
      if (item[key].length > 0) {
        aItem[key] = item[key].split(',')
        if (!Array.isArray(aItem[key])) {
          aItem[key] = [aItem[key]]
        }
      } else {
        aItem[key] = []
      }
    }
  })
  console.log(`processGetProps result:\n${JSON.stringify(aItem)}`)
  return aItem
}

export const genericInit = (Model) => (id) => {
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
}

export const genericFindById = (Model) => (id) => {
  const query = SQL`SELECT * FROM `
    .append(Model.name)
    .append(SQL` WHERE id=${id};`)

  return Model.app.storage.db.get(query)
    .then((res) => {
      if (!res) return res
      return processGetProps(Model, res)
    })
    .catch((err) => { throw err })
}

export const genericFindOne = (Model) => (opt) => {
  const aKeys = Object.keys(opt.where)
  const aValues = Object.values(opt.where)

  const query = SQL`SELECT * FROM `.append(Model.name)

  let delim = ' WHERE '
  aKeys.map((key, ndx) => {
    query.append(delim)
    delim = ' AND '
    query.append(key).append(SQL`=${aValues[ndx]}`)
  })
  query.append(';')

  return Model.app.storage.db.get(query)
    .then((res) => processGetProps(Model, res))
    .catch((err) => { throw err })
}

export const genericFindAll = (Model) => (opt) => {
  console.log('findAll - opt')
  console.log(opt)
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
      console.log('all:')
      console.log(res)
      return res.map((item) => processGetProps(Model, item))
    })
    .catch((err) => { throw err })
}

export const genericCount = (Model) => () => {
  const query = SQL`SELECT count(*) FROM `.append(Model.name)
  return Model.app.storage.db.get(query)
    .then((res) => Object.values(res)[0])
    .catch((err) => { throw err })
}

export const genericDelete = (Model) => (id) => {
  const query = SQL`SELECT * FROM `.append(Model.name).append(SQL` WHERE id=${id}`)
  return Model.app.storage.db.get(query)
    .then((res) => {
      if (!res) {
        throw new Error(`sqlite.genericDelete: user with id ${id} not found`)
      }
      const aQuery = SQL`DELETE FROM `.append(Model.name).append(SQL` WHERE id=${id};`)
      return Promise.all([res, Model.app.storage.db.run(aQuery)])
    })
    .then((values) => {
      return values[0] // res
    })
    .catch((err) => { throw err })
}

export const genericDeleteAll = (Model) => (opt) => {
  const findAll = genericFindAll(Model)
  const deleteById = genericDelete(Model)

  return findAll(opt)
    .then((res) => {
      if (res) {
        return Promise.all(res.map((item) => deleteById(item.id)))
      }
      return null
    })
    .catch((err) => { throw err })
}

export const genericClearData = (Model) => () => Model.app.storage.db.run(SQL`DELETE FROM `.append(Model.name))

export const genericCreate = (Model) => (item) => {
  // process props with hooks (default value / beforeSet
  console.log(`--\n${Model.name}.genericCreate(${JSON.stringify(item)})\n`)
  let aNames = ''
  let delim = '('

  const aItem = processDefaults(Model, item)
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

  console.log(`\nQuery prepared:\nSQL:${JSON.stringify(query.sql)}\nValues:${JSON.stringify(query.values)}`)
  const getById = genericFindById(Model)
  return Model.app.storage.db.run(query)
    .then(() => getById(aItem.id))
    .then((res) => {
      console.log(`created item: ${JSON.stringify(res)}`)
      return res
    })
    .catch((err) => {
      console.log(`--\nError: ${JSON.stringify(err)}`)
      throw err
    })
}

export const genericUpdate = (Model) => (item) => {
  if (!item.id) {
    return Promise.reject(new Error('user.update: item.id should have proper value'))
  }

  const aKeys = Object.keys(item)
  const aItem = processDefaults(Model, item)
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

  const getItem = genericFindById(Model)
  return Model.app.storage.db.run(query)
    .then(() => getItem(item.id))
    .catch((err) => { throw err })
}
