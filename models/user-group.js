import _ from 'lodash'
import uuid from 'uuid/v4'

import dataUserGroupSystem from '../data/user-group-system'
import dataUserGroup from '../data/user-group'

/*

## UserGroup:

* id
* name
* systemType: null, Admin, Guest, LoggedIn
* users: [User]

## System types:

* Null: all members are defined by users, not system
* Admin: system type for admin user (first user in system at least) - manually can be added other user accounts
* Guest: not authenticated user
* LoggedIn: Authenticated users (any - admin, other users)

*/

export default module.exports = (app) => {
  const systemTypeNone = null
  const systemTypeAdmin = 'Admin'
  const systemTypeGuest = 'Guest'
  const systemTypeLoggedIn = 'LoggedIn'

  const Model = {
    name: 'UserGroup',
    props: [
      {
        name: 'id',
        type: 'id',
        default: () => uuid()
      },
      {
        name: 'name',
        type: 'text',
        default: null
      },
      {
        name: 'systemType',
        type: 'text',
        default: systemTypeNone
      },
      {
        name: 'users',
        type: 'refs',
        default: []
      }
    ]
  }
  let _systemGroupAdmin = null
  let _systemGroupGuest = null
  let _systemGroupLoggedIn = null

  if (!app.consts) {
    app.consts = {}
  }

  app.consts.systemTypeNone = systemTypeNone
  app.consts.systemTypeAdmin = systemTypeAdmin
  app.consts.systemTypeGuest = systemTypeGuest
  app.consts.systemTypeLoggedIn = systemTypeLoggedIn

  Model.app = app
  const _init = app.storage.init(Model)

  return _.merge(Model, {
    processDefaults: app.storage.processDefaults(Model),
    processGetProps: app.storage.processGetProps(Model),
    initData: () => {
      return _init()
        .then(() => Model.findOne({ where: { systemType: systemTypeAdmin } }))
        .then((group) => {
          if (group) {
            _systemGroupAdmin = group.id
          }
          return Model.findOne({ where: { systemType: systemTypeGuest } })
        })
        .then((group) => {
          if (group) {
            _systemGroupGuest = group.id
          }
          return Model.findOne({ where: { systemType: systemTypeLoggedIn } })
        })
        .then((group) => {
          if (group) {
            _systemGroupLoggedIn = group.id
          }
        })
        .catch((err) => { throw err })
    },
    clearData: app.storage.clearData(Model),
    findById: app.storage.findById(Model),
    findOne: app.storage.findOne(Model),
    findAll: app.storage.findAll(Model),
    count: app.storage.count(Model),
    removeById: app.storage.removeById(Model),
    removeAll: app.storage.removeAll(Model),
    create: app.storage.create(Model),
    update: app.storage.update(Model),

    systemGroupAdmin: () => _systemGroupAdmin,
    systemGroupGuest: () => _systemGroupGuest,
    systemGroupLoggedIn: () => _systemGroupLoggedIn,

    findGroupsForUser: (userId) => {
      return Model.findAll()
        .then((groups) => {
          const userGroups = []
          groups.map((group) => {
            if (_.includes(group.users, userId)) {
              userGroups.push(group)
            }
          })
          return userGroups
        })
        .catch((err) => { throw err })
    },

    isUserInGroup: (groupId, userId) => {
      if (!groupId || !userId) {
        return Promise.resolve(new Error('UserGroup.isUserInGroup: group id and user id should be specified'))
      }

      // console.log(`UserGroup.isUserInGroup(${groupId},${userId})`)
      return Model.findById(groupId)
        .then((group) => {
          // console.log(`found group:`)
          // console.log(group)
          if (!group) {
            throw new Error(`isUserInGroup: group ${groupId} not found`)
          }
          return _.includes(group.users, userId)
        })
        .catch((err) => { throw err })
    },
    addUser: (groupId, userId) => {
      return Model.findById(groupId)
        .then((group) => {
          if (!group) {
            throw new Error(`addUser: group ${groupId} not found`)
          }
          group.users = _.union(group.users, [userId])
          return Model.update(group)
        })
        .catch((err) => { throw err })
    },
    removeUser: (groupId, userId) => {
      return Model.findById(groupId)
        .then((group) => {
          if (!group) {
            throw new Error(`removeUser: group ${groupId} not found`)
          }
          _.pull(group.users, userId)
          return Model.update(group)
        })
        .catch((err) => { throw err })
    },
    usersAdd: (groupId, users) => {
      return Model.findById(groupId)
        .then((group) => {
          if (!group) {
            throw new Error(`usersAdd: group ${groupId} not found`)
          }
          group.users = _.union(group.users, users)
          return Model.update(group)
        })
        .catch((err) => { throw err })
    },
    usersRemove: (groupId, users) => {
      return Model.findById(groupId)
        .then((group) => {
          if (!group) {
            throw new Error(`usersRemove: group ${groupId} not found`)
          }
          _.pullAll(group.users, users)
          return Model.update(group)
        })
        .catch((err) => { throw err })
    },
    usersList: (groupId) => {
      return Model.findById(groupId)
        .then((group) => {
          if (!group) {
            throw new Error(`usersList: group ${groupId} not found`)
          }
          return group.users
        })
        .catch((err) => { throw err })
    },
    addUserGroupsForUser: (userId, userGroups) => {
      // console.log(`addUserGroupsForUser: ( ${userId}, ${userGroups})`)
      return Promise.all(userGroups.map((item) => Model.addUser(item, userId)))
    },
    createSystemData: () => {
      // console.log('createSystemData')
      // console.log(aModel)
      // console.log(aModel.clearData.toString())
      return Model.clearData()
        // .then(() => aModel.findAll())
        // .then((res) => {
        //   console.log('findAll:')
        //   console.log(res)
        // })
        .then(() => {
          _systemGroupAdmin = null
          _systemGroupGuest = null
          _systemGroupLoggedIn = null
          // console.log(dataUserGroupSystem)
          const arr = dataUserGroupSystem.map((item) => {
            // console.log('adding item:')
            // console.log(item)
            return Model.create(item)
              .then((newItem) => {
                // console.log('newItem')
                // console.log(newItem)
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
        })
        .then(() => app.models.Invite.clearData())
        .then(() => app.models.Login.clearData())
        .then(() => app.models.User.clearData())
        .then(() => app.models.initPermissions())
        // .then((values) => {
        //   console.log('all groups:')
        //   console.log(values)
        // })
        .catch((err) => { throw err })
    },
    createData: () => Promise.all(dataUserGroup.map((item) => Model.create(item)))
  })
}
