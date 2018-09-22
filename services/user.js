import _ from 'lodash'
import uuid from 'uuid/v4'
import bcrypt from 'bcrypt'

const _users = []

/*
  id
  email
  password
  invitedBy
  inviteDate
  inviteId -> Invite.id
*/

export default module.exports = (app) => {
  return {
    findById: (id) => Promise.resolve(_.find(_users, { id })),
    count: () => Promise.resolve(_users.length),
    findOne: (opt) => Promise.resolve(_.find(_users, [Object.keys(opt.where)[0], Object.values(opt.where)[0]])),
    create: (item) => {
      item.id = uuid()
      const salt = bcrypt.genSaltSync()
      item.password = bcrypt.hashSync(item.password, salt)

      _users.push(item)
      return Promise.resolve(item)
    },
    isPassword: (encodedPassword, password) => bcrypt.compareSync(password, encodedPassword),
    ClearData: () => Promise.resolve(_users.length = 0)
  }
}
