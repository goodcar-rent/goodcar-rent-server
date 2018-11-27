import SQL from 'sql-template-strings'

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
    } else if (prop.type === 'datetime') {
      query.append(delim)
        .append(prop.name)
        .append(SQL` TEXT`)
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
    .catch((err) => { throw err })
}

export const genericFindAll = (Model) => (opt) => {
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

export const genericClearData = (Model) => () => Model.app.storage.db.run(SQL`DELETE FROM `.append(Model.name))

export const genericCreate = (Model) => (item) => {
  // process props with hooks (default value / beforeSet
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

    if (prop.beforeSet && (typeof prop.beforeSet === 'function')) {
      item[prop.name] = prop.beforeSet(item)
    }

    // cope property to tep object
    aItem[prop.name] = item[prop.name]

    // replace boolean values with number:
    if (prop.type === 'boolean') {
      aItem[prop.name] = item[prop.name] ? 1 : 0
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

  return Model.app.storage.db.get(query)
    .then(() => item)
    .catch((err) => { throw err })
}
