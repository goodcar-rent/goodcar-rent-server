import _ from 'lodash'
import uuid from 'uuid/v4'

const _invite = []

/*
  id : uuid
  expireAt : date
  registeredUser : -> User.id
  disabled : boolean
  email: invited to this email
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
      // console.log(`Invite.update:`)
      // console.log(item)
      const foundItem = _.find(_invite, { id: item.id })
      if (!foundItem) {
        return Promise.reject(new Error(`Invite ${item.id} not found`))
      }
      return Promise.resolve(_.merge({}, foundItem, item))
    },

    delete: (id) => Promise.resolve((_.remove(_invite, { id })).length === 1),

    ClearData: () => Promise.resolve(_invite.length = 0)
  }
}
