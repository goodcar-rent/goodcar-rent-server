import uuid from 'uuid/v4'
import _ from 'lodash'

/* Login:
  * id: login identifier, UUID
  * userId: -> User.id: user, associated with this login
  * createdAt: date of logging-in
  * ip: IP address of user's endpoint
*/

export default module.exports = (app) => {
  const Model = {
    name: 'Login',
    props: [
      {
        name: 'id',
        type: 'id',
        default: () => uuid()
      },
      {
        name: 'userId',
        type: 'ref',
        default: null
      },
      {
        name: 'createdAt',
        type: 'datetime',
        default: () => new Date()
      },
      {
        name: 'ip',
        type: 'text',
        default: null
      }
    ]
  }
  Model.app = app
  return _.merge(Model, {
    processDefaults: app.storage.processDefaults(Model),
    processGetProps: app.storage.processGetProps(Model),
    initData: app.storage.init(Model),
    clearData: app.storage.clearData(Model),
    findById: app.storage.findById(Model),
    findOne: app.storage.findOne(Model),
    findAll: app.storage.findAll(Model),
    count: app.storage.count(Model),
    removeById: app.storage.removeById(Model),
    removeAll: app.storage.removeAll(Model),
    create: app.storage.create(Model),
    update: app.storage.update(Model),

    createOrUpdate: (item) => {
      return Model.findOne({ where: { userId: item.userId, ip: item.ip } })
        .then((res) => {
          if (!res) {
            return Model.create(item)
          } else {
            _.assign(item, res)
            item.createdAt = new Date()
            item.id = res.id
            return Model.update(item)
          }
        })
    }
  })
}
