import _ from 'lodash'

export const genericDelete = (Collection) => (id) => Promise.resolve(Collection.pull(_.find(Collection, { id })))

export const genericFindById = (Collection) => (id) => Promise.resolve(_.find(Collection, { id }))

export const genericFindAll = (Collection) => (opt) => {
  if (opt) {
    return Promise.resolve(_.filter(Collection, [Object.keys(opt.where)[0], Object.values(opt.where)[0]]))
  } else {
    return Promise.resolve(Collection)
  }
}

export const genericFindOne = (Collection) => (opt) =>
  Promise.resolve(_.find(Collection, [Object.keys(opt.where)[0], Object.values(opt.where)[0]]))

export const genericCount = (Collection) => () => Promise.resolve(Collection.length)

export const genericClearData = (Collection) => () => Promise.resolve(Collection.length = 0)