import uuid from 'uuid/v4'
import {
  genericClearData,
  genericCount,
  genericDelete,
  genericDeleteAll,
  genericFindAll,
  genericFindById,
  genericFindOne,
  genericUpdate
} from '../generic-model'

const _logins = []

/* Login:
  * id: login identifier, UUID
  * userId: -> User.id: user, associated with this login
  * createdAt: date of logging-in
  * ip: IP address of user's endpoint
*/

export default module.exports = (app) => {
  const Model = {
    findById: genericFindById(_logins),
    findOne: genericFindOne(_logins),
    findAll: genericFindAll(_logins),
    count: genericCount(_logins),
    delete: genericDelete(_logins),
    deleteAll: genericDeleteAll(_logins),
    clearData: genericClearData(_logins),
    initData: () => Promise.resolve(true),
    update: genericUpdate(_logins),
    create: (item) => {
      if (!item.id) {
        item.id = uuid()
      }
      if (!item.createdAt) {
        item.createdAt = Date.now()
      }
      _logins.push(item)
      return Promise.resolve(item)
    },
    createOrUpdate: (item) => {
      return Model.findOne({ where: { userId: item.userId, ip: item.ip } })
        .then((res) => {
          if (!res) {
            return Model.create(item)
          } else {
            item.createdAt = Date.now()
            return Model.update(item)
          }
        })
    }
  }

  return Model
}
