import uuid from 'uuid/v4'
import _ from 'lodash'
import { crudRoutes } from './route-builder'

export const Session = (app, options) => {
  if (!options) {
    options = {}
  }
  options.storage = options.storage || 'default'

  const Model = {
    name: 'Session',
    priority: 0,
    generateRoutes: crudRoutes,
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
            return Model.update(item)
          }
        })
        .catch((e) => { throw e })
    }
  }
  return Model
}
