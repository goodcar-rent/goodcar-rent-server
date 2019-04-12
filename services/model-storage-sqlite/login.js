import uuid from 'uuid/v4'
import _ from 'lodash'
import {
  genericInit,
  genericFindById,
  genericFindOne,
  genericFindAll,
  genericCount,
  genericDelete,
  genericClearData,
  genericCreate,
  genericUpdate,
  genericDeleteAll
} from './generic-sqlite'

/* Login:
  * id: login identifier, UUID
  * userId: -> User.id: user, associated with this login
  * createdAt: date of logging-in
  * ip: IP address of user's endpoint
*/

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
      default: () => Date.now()
    },
    {
      name: 'ip',
      type: 'text',
      default: null
    }
  ]
}

export default module.exports = (app) => {
  Model.app = app
  const aModel = {
    initData: genericInit(Model),
    clearData: genericClearData(Model),
    findById: genericFindById(Model),
    findOne: genericFindOne(Model),
    findAll: genericFindAll(Model),
    count: genericCount(Model),
    delete: genericDelete(Model),
    deleteAll: genericDeleteAll(Model),
    create: genericCreate(Model),
    update: genericUpdate(Model),

    createOrUpdate: (item) => {
      return aModel.findOne({ where: { userId: item.userId, ip: item.ip } })
        .then((res) => {
          if (!res) {
            return aModel.create(item)
          } else {
            _.assign(item,res)
            item.createdAt = Date.now()
            item.id = res.id
            return aModel.update(item)
          }
        })
    }
  }
  return aModel
}
