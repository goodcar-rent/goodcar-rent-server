import * as ACCESS from './const-access'
import { AccessObjectType } from './model-access-object'

export const InitAccess = (app) => () => {
  const User = app.exModular.models.User
  const UserGroup = app.exModular.models.UserGroup
  const AccessObject = app.exModular.models.AccessObject
  const PermissionUser = app.exModular.models.PermissionUser
  const PermissionUserGroup = app.exModular.models.PermissionUserGroup

  const Serial = app.exModular.services.serial

  return Promise.resolve()
    .then(() => UserGroup.findById(ACCESS.ADMIN_GROUP_ID))
    .then((item) => {
      if (!item) {
        return UserGroup.create({
          id: ACCESS.ADMIN_GROUP_ID,
          name: ACCESS.AccessSystemType.Admin.caption,
          systemType: ACCESS.AccessSystemType.Admin.value,
          users: []
        })
      }
      return item
    })
    .then(() => UserGroup.findById(ACCESS.LOGGED_GROUP_ID))
    .then((item) => {
      if (!item) {
        return UserGroup.create({
          id: ACCESS.LOGGED_GROUP_ID,
          name: ACCESS.AccessSystemType.Logged.caption,
          systemType: ACCESS.AccessSystemType.Logged.value,
          users: []
        })
      }
      return item
    })
    .then(() => User.findById(ACCESS.GUEST_ID))
    .then((item) => {
      if (!item) {
        return User.create({
          id: ACCESS.GUEST_ID,
          name: '(GUEST)',
          disabled: true
        })
      }
      return item
    })
    .then((item) => {
      app.exModular.access.ACCESS_GUEST = item
      return {}
    })
    .then(() => {
      return Serial(app.exModular.routes.map((route) => () => {
        return AccessObject.findOne({ where: { objectName: route.name } })
          .then((_item) => {
            if (!_item) {
              return AccessObject.create({
                id: route.name,
                objectName: route.name,
                type: AccessObjectType.Controller.value
              })
            }
            return _item
          })
          .catch((e) => { throw e })
      }))
    })
    .then(() => PermissionUser.findOne({
      where: {
        userId: app.exModular.access.ACCESS_GUEST.id,
        accessObjectId: 'Auth.Signup'
      }
    }))
    .then((item) => {
      if (!item) {
        return PermissionUser.create({
          userId: app.exModular.access.ACCESS_GUEST.id,
          accessObjectId: 'Auth.Signup',
          permission: ACCESS.ALLOW,
          withGrant: false
        })
      }
    })
    .then(() => PermissionUser.findOne({
      where: {
        userId: app.exModular.access.ACCESS_GUEST.id,
        accessObjectId: 'Auth.Login'
      }
    }))
    .then((item) => {
      if (!item) {
        return PermissionUser.create({
          userId: app.exModular.access.ACCESS_GUEST.id,
          accessObjectId: 'Auth.Login',
          permission: ACCESS.ALLOW,
          withGrant: false
        })
      }
    })
    .then(() => PermissionUser.findOne({
      where: {
        userId: app.exModular.access.ACCESS_GUEST.id,
        accessObjectId: 'Auth.Logout'
      }
    }))
    .then((item) => {
      if (!item) {
        return PermissionUser.create({
          userId: app.exModular.access.ACCESS_GUEST.id,
          accessObjectId: 'Auth.Logout',
          permission: ACCESS.ALLOW,
          withGrant: false
        })
      }
    })
    .then(() => PermissionUserGroup.findOne({
      where: {
        userGroupId: app.exModular.access.LOGGED_GROUP_ID,
        accessObjectId: 'Me'
      }
    }))
    .then((item) => {
      if (!item) {
        return PermissionUserGroup.create({
          userGroupId: app.exModular.access.LOGGED_GROUP_ID,
          accessObjectId: 'Me',
          permission: ACCESS.ALLOW,
          withGrant: false
        })
      }
    })
    .then(() => PermissionUserGroup.findOne({
      where: {
        userGroupId: app.exModular.access.LOGGED_GROUP_ID,
        accessObjectId: 'Me.Groups'
      }
    }))
    .then((item) => {
      if (!item) {
        return PermissionUserGroup.create({
          userGroupId: app.exModular.access.LOGGED_GROUP_ID,
          accessObjectId: 'Me.Groups',
          permission: ACCESS.ALLOW,
          withGrant: false
        })
      }
    })
    .then(() => PermissionUserGroup.findOne({
      where: {
        userGroupId: app.exModular.access.LOGGED_GROUP_ID,
        accessObjectId: 'MeAccess.list'
      }
    }))
    .then((item) => {
      if (!item) {
        return PermissionUserGroup.create({
          userGroupId: app.exModular.access.LOGGED_GROUP_ID,
          accessObjectId: 'MeAccess.list',
          permission: ACCESS.ALLOW,
          withGrant: false
        })
      }
    })
    .then(() => PermissionUserGroup.findOne({
      where: {
        userGroupId: app.exModular.access.LOGGED_GROUP_ID,
        accessObjectId: 'MeGrant.list'
      }
    }))
    .then((item) => {
      if (!item) {
        return PermissionUserGroup.create({
          userGroupId: app.exModular.access.LOGGED_GROUP_ID,
          accessObjectId: 'MeGrant.list',
          permission: ACCESS.ALLOW,
          withGrant: false
        })
      }
    })
    .then(() => PermissionUserGroup.findOne({
      where: {
        userGroupId: app.exModular.access.LOGGED_GROUP_ID,
        accessObjectId: 'MeGrant.create'
      }
    }))
    .then((item) => {
      if (!item) {
        return PermissionUserGroup.create({
          userGroupId: app.exModular.access.LOGGED_GROUP_ID,
          accessObjectId: 'MeGrant.create',
          permission: ACCESS.ALLOW,
          withGrant: false
        })
      }
    })
    .then(() => PermissionUserGroup.findOne({
      where: {
        userGroupId: app.exModular.access.LOGGED_GROUP_ID,
        accessObjectId: 'MeGrant.item'
      }
    }))
    .then((item) => {
      if (!item) {
        return PermissionUserGroup.create({
          userGroupId: app.exModular.access.LOGGED_GROUP_ID,
          accessObjectId: 'MeGrant.item',
          permission: ACCESS.ALLOW,
          withGrant: false
        })
      }
    })
    .then(() => PermissionUserGroup.findOne({
      where: {
        userGroupId: app.exModular.access.LOGGED_GROUP_ID,
        accessObjectId: 'MeGrant.save'
      }
    }))
    .then((item) => {
      if (!item) {
        return PermissionUserGroup.create({
          userGroupId: app.exModular.access.LOGGED_GROUP_ID,
          accessObjectId: 'MeGrant.save',
          permission: ACCESS.ALLOW,
          withGrant: false
        })
      }
    })
    .then(() => PermissionUserGroup.findOne({
      where: {
        userGroupId: app.exModular.access.LOGGED_GROUP_ID,
        accessObjectId: 'MeGrant.remove'
      }
    }))
    .then((item) => {
      if (!item) {
        return PermissionUserGroup.create({
          userGroupId: app.exModular.access.LOGGED_GROUP_ID,
          accessObjectId: 'MeGrant.remove',
          permission: ACCESS.ALLOW,
          withGrant: false
        })
      }
    })
    .then(() => PermissionUserGroup.findOne({
      where: {
        userGroupId: app.exModular.access.LOGGED_GROUP_ID,
        accessObjectId: 'MeGrant.removeAll'
      }
    }))
    .then((item) => {
      if (!item) {
        return PermissionUserGroup.create({
          userGroupId: app.exModular.access.LOGGED_GROUP_ID,
          accessObjectId: 'MeGrant.removeAll',
          permission: ACCESS.ALLOW,
          withGrant: false
        })
      }
    })
    .catch((e) => { throw e })
}
