import _ from 'lodash'

export default (app) => {
  const Storage = {
    aclStorage: []
  }

  return _.merge(Storage, {
    findById: (id) => _.find(Storage.aclStorage, { id: id.toLowerCase() }),
    findOne: (opt) => _.find(Storage.aclStorage, opt),
    findAll: () => Storage.aclStorage,
    add: (item) => {
      Storage.aclStorage.push(item)
      return Storage.aclStorage.length
    }
  })
}
