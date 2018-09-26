import _ from 'lodash'
import uuid from 'uuid/v4'

const _userGroup = []

/*

## UserGroup:

  id
  name
  systemType: null, Admin, Guest, LoggedIn
  users: [User]

## System types:

* Null: all members are defined by users, not system
* Admin: system type for admin user (first user in system at least) - manually can be added other user accounts
* Guest: not authenticated user
* LoggedIn: Authenticated users (any - admin, other users)

*/

export default module.exports = (app) => {
  return {
    findById: (id) => Promise.resolve(_.find(_userGroup, { id })),
    findOne: (opt) => Promise.resolve(_.find(_userGroup, [Object.keys(opt.where)[0], Object.values(opt.where)[0]])),
    count: () => Promise.resolve(_userGroup.length),
    create: (item) => {
      item.id = uuid()
      _userGroup.push(item)
      return Promise.resolve(item)
    },
    addUser: (id, userId) => {
      const group = _.find(_userGroup, { id })
      if (!group) {
        return Promise.reject(group)
      }
      _.union(group.users, [userId])
      return Promise.resolve(group)
    },
    removeUser: (id, userId) => {
      const group = _.find(_userGroup, { id })
      if (!group) {
        return Promise.reject(group)
      }
      _.pull(group.users, [userId])
      return Promise.resolve(group)
    },
    ClearData: () => Promise.resolve(_userGroup.length = 0)
  }
}
