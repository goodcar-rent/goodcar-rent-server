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

export const systemTypeNone = null

export const systemTypeAdmin = 'Admin'

export const systemTypeGuest = 'Guest'

export const systemTypeLoggedIn = 'LoggedIn'

export default (app) => {
  return {
    findById: (id) => Promise.resolve(_.find(_userGroup, { id })),
    findOne: (opt) => Promise.resolve(_.find(_userGroup, [Object.keys(opt.where)[0], Object.values(opt.where)[0]])),
    findAll: (opt) => Promise.resolve(_.filter(_userGroup, [Object.keys(opt.where)[0], Object.values(opt.where)[0]])),
    findGroupsForUser: (user) => Promise.resolve(_.filter(_userGroup, (item) => (_.index(item.users, user) !== -1))),
    count: () => Promise.resolve(_userGroup.length),
    create: (item) => {
      item.id = uuid()
      if (!item.systemType) {
        item.systemType = systemTypeNone
      }
      _userGroup.push(item)
      return Promise.resolve(item)
    },
    addUser: (groupId, user) => {
      const group = _.find(_userGroup, { id: groupId })
      if (!group) {
        return Promise.reject(group)
      }
      _.union(group.users, [user])
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
