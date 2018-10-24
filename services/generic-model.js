import _ from 'lodash'

export const genericDelete = (Collection) => (id) => {
  const aItem = _.find(Collection, { id })
  if (!aItem) {
    return Promise.reject(new Error(`genericDelete: item ${id} not found in collection`))
  }
  _.remove(Collection, { id })
  return Promise.resolve(1)
}

// Remove all elements from collection using where option. Returns count of removed elements
export const genericDeleteAll = (Collection) => (opt) => {
  if (!opt || !opt.where) {
    return Promise.reject(new Error(`genericDeleteAll: invalid opt param - ${opt}`))
  }
  const arr = _.remove(Collection, opt.where)
  return Promise.resolve(arr.count)
}

export const genericFindById = (Collection) => (id) => Promise.resolve(_.find(Collection, { id }))

export const genericFindAll = (Collection) => (opt) => {
  if (opt && opt.where) {
    return Promise.resolve(_.filter(Collection, opt.where))
  } else {
    return Promise.resolve(Collection)
  }
}

export const genericFindOne = (Collection) => (opt) =>
  Promise.resolve(_.find(Collection, opt.where))

export const genericCount = (Collection) => () => Promise.resolve(Collection.length)

export const genericClearData = (Collection) => () => Promise.resolve(Collection.length = 0)

export const genericUpdate = (Collection) => (item) => {
  let aItem = _.find(Collection, { id: item.id })
  if (!aItem) {
    return Promise.reject(new Error('genericUpdate: item not found'))
  }
  return Promise.resolve(_.assign(aItem, item))
}
