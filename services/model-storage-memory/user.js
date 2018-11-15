import uuid from 'uuid/v4'
import _ from 'lodash'
import bcrypt from 'bcrypt'
import {
  genericClearData,
  genericCount,
  genericDelete,
  genericFindAll,
  genericFindById,
  genericFindOne
} from '../generic-model'

const _users = []

/* User:
  * id: user identifier, UUID
  * email: email, that user choose for registering
  * password: hashed password
  * invitedBy: -> User.id: user that created invite
  * inviteDate: date of invite
  * inviteId -> Invite.id: link to invite
  * disabled: if user account is disabled
*/

export default module.exports = (app) => {
  return {
    findById: genericFindById(_users),
    findOne: genericFindOne(_users),
    findAll: genericFindAll(_users),
    count: genericCount(_users),
    delete: genericDelete(_users),
    ClearData: genericClearData(_users),
    create: (item) => {
      item.id = uuid()
      const salt = bcrypt.genSaltSync()
      item.password = bcrypt.hashSync(item.password, salt)

      if (!item.disabled) {
        item.disabled = false
      }

      if (!item.invitedBy) {
        item.invitedBy = null
      }

      if (!item.inviteDate) {
        item.inviteDate = null
      }

      if (!item.inviteId) {
        item.inviteId = null
      }
      _users.push(item)
      return Promise.resolve(item)
    },
    update: (item) => {
      if (!item.id) {
        return Promise.reject(new Error('user.update: item.id should have proper value'))
      }

      let aItem = _.find(_users, { id: item.id })
      if (!aItem) {
        return Promise.reject(new Error('user.update: item not found'))
      }

      if (item.password) {
        const salt = bcrypt.genSaltSync()
        item.password = bcrypt.hashSync(item.password, salt)
      }

      return Promise.resolve(_.assign(aItem, item))
    },
    isPassword: (encodedPassword, password) => bcrypt.compareSync(password, encodedPassword)
  }
}
