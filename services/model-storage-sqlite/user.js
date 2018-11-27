import SQL from 'sql-template-strings'

import uuid from 'uuid/v4'
import bcrypt from 'bcrypt'
import {
  genericInit,
  genericFindById,
  genericFindOne, genericFindAll, genericCount, genericDelete, genericClearData, genericCreate
} from './generic-sqlite'

/* User:
  * id: user identifier, UUID
  * email: email, that user choose for registering
  * password: hashed password
  * invitedBy: -> User.id: user that created invite
  * inviteDate: date of invite
  * inviteId -> Invite.id: link to invite
  * disabled: if user account is disabled
*/

const Model = {
  name: 'User',
  props: [
    {
      name: 'id',
      type: 'id',
      default: () => uuid()
    },
    {
      name: 'email',
      type: 'email',
      default: null
    },
    {
      name: 'password',
      type: 'password',
      default: null,
      beforeSet: (item) => bcrypt.hashSync(item.password, bcrypt.genSaltSync())
    },
    {
      name: 'invitedBy',
      type: 'ref',
      default: null
    },
    {
      name: 'inviteDate',
      type: 'datetime',
      default: null
    },
    {
      name: 'inviteId',
      type: 'ref',
      default: null
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: false
    }
  ]
}

export default module.exports = (app) => {
  Model.app = app
  return {
    initData: genericInit(Model),
    findById: genericFindById(Model),
    findOne: genericFindOne(Model),
    findAll: genericFindAll(Model),
    count: genericCount(Model),
    delete: genericDelete(Model),
    clearData: genericClearData(Model),
    create: genericCreate(Model),

    update: (item) => {
      if (!item.id) {
        return Promise.reject(new Error('user.update: item.id should have proper value'))
      }

      if (item.password) {
        const salt = bcrypt.genSaltSync()
        item.password = bcrypt.hashSync(item.password, salt)
      }

      const query = SQL`UPDATE User SET `
      let delim = ' '

      if (item.email) {
        query.append(delim).append(SQL`email=${item.email}`)
        delim = ','
      }
      if (item.password) {
        query.append(delim).append(SQL`password=${item.password}`)
        delim = ','
      }
      if (item.invitedBy) {
        query.append(delim).append(SQL`invitedBy=${item.invitedBy}`)
        delim = ','
      }
      if (item.inviteDate) {
        query.append(delim).append(SQL`inviteDate=${item.inviteDate}`)
        delim = ','
      }
      if (item.inviteId) {
        query.append(delim).append(SQL`inviteId=${item.inviteId}`)
        delim = ','
      }
      if (item.disabled) {
        const val = item.disabled ? 1 : 0
        query.append(delim).append(SQL` disabled=${val}`)
        delim = ','
      }

      query.append(SQL` WHERE id=${item.id};`)

      console.log('query')
      console.log(query.sql)
      console.log(query.values)
      return app.storage.db.run(query)
        .then(() => app.storage.db.get(SQL`SELECT * FROM User WHERE id=${item.id}`))
        .then((res) => {
          if (res.disabled) {
            res.disabled = true
          } else {
            res.disabled = false
          }
          return res
        })
        .catch((err) => { throw err })
    },

    isPassword: (encodedPassword, password) => bcrypt.compareSync(password, encodedPassword)
  }
}
