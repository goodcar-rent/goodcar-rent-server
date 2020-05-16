import { v4 as uuid } from 'uuid'
import _ from 'lodash'

export const Session = (app, options) => {
  if (!options) {
    options = {}
  }
  options.storage = options.storage || 'default'

  const Model = {
    name: 'Session',
    priority: 0,
    props: [
      {
        name: 'id',
        type: 'id',
        default: () => uuid()
      },
      {
        name: 'userId',
        type: 'ref',
        model: 'User',
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
    ],
    createOrUpdate: (item) => {
      return Model.findOne({ where: { userId: item.userId, ip: item.ip } })
        .then((res) => {
          if (!res) {
            return Model.create(item)
          } else {
            _.assign(item, res)
            item.createdAt = new Date()
            item.id = res.id
            return Model.update(item.id, item)
          }
        })
        .catch((e) => { throw e })
    }
  }
  return Model
}
