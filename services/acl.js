/*
ACL(object, permission):

Get all permissions for object's groups
Get all permissions for object itself

Get all user's groups

Set DENY permission

Check if any group permission is ok for this object: for groups/user

Check if any group have DENY permission: groups/user

Check if any object permission is allow: groups/user

Check if any object permission is DENY: groups/user

*/

import _ from 'lodash'

export const kindAllow = 'ALLOW'

export const kindDeny = 'DENY'

const aclObject = []
const aclObjectGroup = []

export const CheckPermission = (userId, object, permission) => {
}

const FindOrAddObject = (objectId) => {
  let aObject = _.find(aclObject, { id: objectId })
  if (!aObject) {
    aObject = { id: objectId, permissions: [] }
    aclObject.push(aObject)
  }
  return aObject
}

const FindOrAddPermission = (aObject, permission) => {
  let aPermission = _.find(aObject.permissions, { permission })
  if (!aPermission) {
    aPermission = { permission, users: [], userGroups: [] }
    aObject.permissions.push(aPermission)
  }
  return aPermission
}

export default module.exports = (app) => {
  const { UserGroup } = app.model

  return {
    ACL: (object, permission) => {
      // get all user info:
      const userGroups = UserGroup.findAll()
      return false
    },
    AddUserPermission: (userId, objectId, permission, kind) => {
      const aKind = kind || kindAllow

      const aObject = FindOrAddObject(objectId)
      const aPermission = FindOrAddPermission(aObject, permission)
      let aUser = _.find(aPermission.users, { userId })
      if (!aUser) {
        aPermission.users.push({ userId, kind: aKind })
      } else {
        aUser.kind = aKind
      }
    },
    AddGroupPermission: (groupId, objectId, permission, kind) => {
      const aKind = kind || kindAllow
      const aObject = FindOrAddObject(objectId)
      const aPermission = FindOrAddPermission(aObject, permission)
      let aGroup = _.find(aPermission.userGroups, { groupId })
      if (!aGroup) {
        aPermission.userGroups.push({ groupId, kind: aKind })
      } else {
        aGroup.kind = aKind
      }
    }
  }
}
