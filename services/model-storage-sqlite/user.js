import SQL from 'sql-template-strings'

import uuid from 'uuid/v4'
import _ from 'lodash'
import bcrypt from 'bcrypt'

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
    initData: () => {
      app.storage.db.run(
        SQL`CREATE TABLE IF NOT EXISTS "User" ( 
          "id" TEXT PRIMARY KEY,
          "email" TEXT,
          "password" TEXT,
          "invitedBy" TEXT,
          "inviteDate" TEXT,
          "inviteId" TEXT,
          "disabled" INTEGER 
          );`
      )
    },

    findById: (id) => {
      return app.storage.db.get(
        SQL`SELECT * FROM "User" WHERE id=${id};`
      )
    },

    findOne: (opt) => {
      const field = (Object.keys(opt.where))[0]
      const val = (Object.values(opt.where))[0]
      const query = SQL`SELECT * FROM "User" WHERE `
        .append(field)
        .append(SQL`=${val} LIMIT 1;`)
      return app.storage.db.get(query)
        .catch((err) => {
          console.log('err')
          console.log(err)
          throw err
        })
    },

    findAll: (opt) => {
      const query = SQL`SELECT * FROM User`
      if (opt) {
        const field = (Object.keys(opt.where))[0]
        const val = (Object.values(opt.where))[0]
        query.append(field).append(SQL`=${val}`)
      }
      return app.storage.db.all(query)
    },

    count: () => app.storage.db.get(SQL`SELECT count(*) FROM "User";`)
      .then((res) => Object.values(res)[0])
      .catch((err) => { throw err }),

    delete: (id) => {
      return app.storage.db.get(SQL`SELECT * FROM User WHERE id=${id}`)
        .then((res) => {
          if (!res) {
            throw new Error(`User.delete: user with id ${id} not found`)
          }
          return Promise.all([res, app.storage.db.run(SQL`DELETE FROM "User" WHERE id=${id};`)])
        })
        .then((values) => {
          return values[0] // res
        })
        .catch((err) => { throw err })
    },

    clearData: () => app.storage.db.run(SQL`DELETE FROM "User";`),

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
      // _users.push(item)
      return app.storage.db.get(
        SQL`INSERT INTO User 
          (id,email,password,invitedBy,inviteDate,inviteId,disabled)
        VALUES
          (${item.id},${item.email},${item.password},${item.invitedBy},${item.inviteDate},${item.inviteId},${item.disabled});`)
        .then(() => item)
        .catch((err) => { throw err })
    },

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
