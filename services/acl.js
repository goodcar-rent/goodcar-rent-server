/*
ACL algo:

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

export default module.exports = (app) => {
  return {
    Allow: (userId, objectId, permissionId) => {
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
