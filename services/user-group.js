import _ from 'lodash'
import uuid from 'uuid/v4'

import dataUserGroupSystem from '../data/user-group-system'
import dataUserGroup from '../data/user-group'

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
  let _systemGroupAdmin = null
  let _systemGroupGuest = null
  let _systemGroupLoggedIn = null

  const Model = {
    systemGroupAdmin: () => _systemGroupAdmin,
    systemGroupGuest: () => _systemGroupGuest,
    systemGroupLoggedIn: () => _systemGroupLoggedIn,
    findById: (id) => Promise.resolve(_.find(_userGroup, { id })),
    findOne: (opt) => Promise.resolve(_.find(_userGroup, [Object.keys(opt.where)[0], Object.values(opt.where)[0]])),
    findAll: (opt) => {
      if (opt) {
        return Promise.resolve(_.filter(_userGroup, [Object.keys(opt.where)[0], Object.values(opt.where)[0]]))
      } else {
        return Promise.resolve(_userGroup)
      }
    },
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
    addUser: (groupId, userId) => {
      const group = _.find(_userGroup, { id: groupId })
      if (!group) {
        return Promise.reject(group)
      }
      _.union(group.users, [userId])
      return Promise.resolve(group)
    },
    removeUser: (groupId, userId) => {
      const group = _.find(_userGroup, { id: groupId })
      if (!group) {
        return Promise.reject(group)
      }
      _.pull(group.users, [userId])
      return Promise.resolve(group)
    },
    createSystemData: () => {
      Model.ClearData()
      _systemGroupAdmin = null
      _systemGroupGuest = null
      _systemGroupLoggedIn = null
      const arr = dataUserGroupSystem.map((item) => {
        Model.create(item)
          .then((newItem) => {
            if (!newItem) throw Error('Fail to create new UserGroup')

            if (newItem.systemType && newItem.systemType === systemTypeAdmin) {
              if (_systemGroupAdmin) throw new Error('SystemData have duplicate Admin group')
              _systemGroupAdmin = newItem.id
            } else if (newItem.systemType && newItem.systemType === systemTypeGuest) {
              if (_systemGroupGuest) throw new Error('SystemData have duplicate Guest group')
              _systemGroupGuest = newItem.id
            } else if (newItem.systemType && newItem.systemType === systemTypeLoggedIn) {
              if (_systemGroupLoggedIn) throw new Error('SystemData have duplicate LoggedIn group')
              _systemGroupLoggedIn = newItem.id
            }
          })
      })
      return Promise.all(arr)
    },
    createData: () => Promise.all(dataUserGroup.map((item) => Model.create(item))),
    ClearData: () => Promise.resolve(_userGroup.length = 0)
  }
  return Model
}
