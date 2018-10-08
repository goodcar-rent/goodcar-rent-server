/*
Allow(user, object, permission):

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

export default module.exports = (app) => {
  const { UserGroup } = app.model
  return {
    Allow: (user, object, permission) => {
      // get all user info:
      const userGroups = UserGroup.findAll
      return false
    },
    AddUserPermission: (userId, objectId, permissionId, kind) => {
      const aKind = kind || kindAllow
    },
    AddGroupPermission: (groupId, objectId, permissionId, kind) => {
      const aKind = kind || kindAllow
    },

  }
}
