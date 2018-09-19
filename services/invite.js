import _ from 'lodash'
import uuid from 'uuid/v4'

const _invite = []

/*
  id
  expireAt
  registeredUser
  disabled
*/

export default module.exports = (app) => {
  return {
    findById: (id) => Promise.resolve(_.find(_invite, { id })),

    findOne: (opt) => Promise.resolve(_.find(_invite, [Object.keys(opt.where)[0], Object.values(opt.where)[0]])),

    findAll: () => Promise.resolve(_invite),

    count: () => Promise.resolve(_invite.length),

    create: (item) => {
      item.id = uuid()

      _invite.push(item)
      return Promise.resolve(item)
    },

    update: (item) => {
      let foundItem = _.find(_invite, {id: item.id})
      if (foundItem) {
        foundItem = _.merge({}, foundItem, item)
      }
      return Promise.resolve(foundItem)
    },

    delete: (id) => Promise.resolve((_.remove(_invite, { id })).length === 1),

    ClearData: () => Promise.resolve(_invite.length = 0)
  }
}
