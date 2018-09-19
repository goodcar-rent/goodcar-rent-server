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
    findAll: () => Promise.resolve(_invite),
    count: () => Promise.resolve(_invite.length),
    findOne: (opt) => Promise.resolve(_.find(_invite, [Object.keys(opt.where)[0], Object.values(opt.where)[0]])),
    create: (item) => {
      item.id = uuid()

      _invite.push(item)
      return Promise.resolve(item)
    },
    updateOne: (id, item) => Promise.resolve( _merge({}, _.find(_invite, { id }), item)),
    ClearData: () => Promise.resolve(_invite.length = 0)
  }
}
