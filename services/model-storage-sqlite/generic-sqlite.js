import SQL from 'sql-template-strings'
import _ from 'lodash'

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
      Model.props.map((prop) => {
        if (prop.type === 'boolean') {
          res[prop.name] = (!!res[prop.name])
        }
        if (prop.type === 'refs' && res[prop.name].length > 0) {
          res[prop.name] = res[prop.name].split(',')
        }
      })
      return res
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
    .then((res) => {
      if (res) {
        Model.props.map((prop) => {
          if (prop.type === 'boolean') {
            res[prop.name] = (!!res[prop.name])
          }
          if (prop.type === 'refs' && res[prop.name].length > 0) {
            res[prop.name] = res[prop.name].split(',')
          }
        })
      }
      return res
    })
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
      res.map((item) => {
        Model.props.map((prop) => {
          if (prop.type === 'boolean') {
            item[prop.name] = (!!item[prop.name])
          }
          if (prop.type === 'refs' && item[prop.name].length > 0) {
            item[prop.name] = item[prop.name].split(',')
          }
        })
      })

      return res
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
  console.log('genericCreate')
  console.log(item)
  const aItem = {}
  let aNames = ''
  let delim = '('
  Model.props.map((prop) => {
    if (!item[prop.name]) {
      // no property in new item, set default value
      if (prop.default) {
        if (typeof prop.default === 'function') {
          item[prop.name] = prop.default(item)
        } else {
          item[prop.name] = prop.default
        }
      }
    }

    if (item[prop.name] && prop.beforeSet && (typeof prop.beforeSet === 'function')) {
      item[prop.name] = prop.beforeSet(item)
    }

    // cope property to tep object
    aItem[prop.name] = item[prop.name]

    // replace boolean values with number:
    if (prop.type === 'boolean') {
      aItem[prop.name] = item[prop.name] ? 1 : 0
    }

    // replace refs array with string representation
    if (prop.type === 'refs') {
      aItem[prop.name] = item[prop.name].join(',')
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
  Model.props.map((prop) => {
    query.append(delim).append(SQL`${aItem[prop.name]}`)
    delim = ','
  })
  query.append(');')

  console.log(query.sql)
  console.log(query.values)
  const getById = genericFindById(Model)
  return Model.app.storage.db.run(query)
    .then(() => getById(item.id))
    .then((res) => {
      console.log(res)
      return res
    })
    .catch((err) => {
      console.log('error')
      console.log(err)
      console.log(item.id)
      throw err
    })
}

export const genericUpdate = (Model) => (item) => {
  if (!item.id) {
    return Promise.reject(new Error('user.update: item.id should have proper value'))
  }

  const aKeys = Object.keys(item)
  const aItem = {}
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
    if (aProp.type === 'boolean') {
      aItem[key] = item[key] ? 1 : 0
    }

    // process refs:
    if (aProp.type === 'refs') {
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
