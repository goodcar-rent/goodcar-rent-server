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
import { ServerNotAllowed } from '../config/errors'

const kindAllow = 'ALLOW'

const kindDeny = 'DENY'

const GuestUserId = -1

/*
ACL.Object:

 * id: identifier for object, like "Invoice"
 * permissions: [] array of permissions:
   * permission: permission name, like "read", "write"
   * users: list of users that have this permission of this kind:
     * id: userId
     * kind: permission, one of ALLOW/DENY
   * userGroups: list of groups that have this permission of this kind
*/

export default module.exports = (app) => {
  const aclObject = []
  const { UserGroup } = app.models

  const FindOrAddObject = (objectId) => {
    let aObject = _.find(aclObject, { id: objectId.toLowerCase() })
    if (!aObject) {
      aObject = { id: objectId.toLowerCase(), permissions: [] }
      aclObject.push(aObject)
    }
    return aObject
  }

  const FindOrAddPermission = (aObject, permission) => {
    let aPermission = _.find(aObject.permissions, { permission: permission.toLowerCase() })
    if (!aPermission) {
      aPermission = { permission: permission.toLowerCase(), users: [], userGroups: [] }
      aObject.permissions.push(aPermission)
    }
    return aPermission
  }

  const CheckPermission = (userId, object, permission) => {
    let aKind = kindDeny

    // check if we have permission for user:
    const aObject = _.find(aclObject, { id: object.toLowerCase() })
    if (!aObject) {
      return kindDeny // no object defined, DENY
    }

    // find specified permission for object:
    const aPermission = _.find(aObject.permissions, { permission: permission.toLowerCase() })
    if (!aPermission) {
      return kindDeny // no permission declaration, DENY
    }

    // check if we have some group permission:
    let groupRes = 0
    const groups = UserGroup.findGroupsForUserSync(userId)
    _.each(groups, (group) => {
      const aGroup = _.find(aPermission.userGroups, { id: group.id })
      if (aGroup && groupRes !== kindDeny) {
        groupRes = aGroup.kind
      }
    })

    // check if specified object have exact user permission:
    let userRes = 0
    const aUser = _.find(aPermission.users, { id: userId })
    if (aUser) {
      userRes = aUser.kind
    }

    // set resulting permission according proprieties:
    if (groupRes !== 0) {
      aKind = groupRes
    }

    if (userRes !== 0) {
      aKind = userRes
    }
    return aKind
  }
  return {
    ACL: (object, permission) => {
      return (req, res, next) => {
        const auth = app.auth.passport.authenticate('jwt', { session: false })
        auth(req, res, () => {
          if (req.user) {
            // user already authenticated:
            if (UserGroup.isUserInGroupSync(UserGroup.systemGroupAdmin(), req.user.id)) {
              next() // user is in system admin group
            } else if (CheckPermission(req.user.id, object, permission) === kindAllow) {
              next() // user have allow kind of permission for this object/permission
            } else {
              next(new ServerNotAllowed(`Permission deny for user on ${object}.${permission}`))
            }
          } else {
            // user not authenticated, check permission for guest user:
            if (CheckPermission(GuestUserId, object, permission) === kindAllow) {
              next()
            } else {
              next(new ServerNotAllowed(`Permission deny for guest user on ${object}.${permission}`))
            }
          }
        })
      }
    },
    AddUserPermission: (userId, objectId, permission, kind) => {
      let aKind = kindAllow
      if (kind) {
        aKind = kind.toUpperCase()
      }

      const aObject = FindOrAddObject(objectId)
      const aPermission = FindOrAddPermission(aObject, permission)
      let aUser = _.find(aPermission.users, { id: userId })
      if (!aUser) {
        aPermission.users.push({ id: userId, kind: aKind })
      } else {
        aUser.kind = aKind
      }
      return {
        userId,
        object: objectId.toLowerCase(),
        permission: permission.toLowerCase(),
        kind: kind.toUpperCase()
      }
    },
    AddGroupPermission: (groupId, objectId, permission, kind) => {
      let aKind = kindAllow
      if (kind) {
        aKind = kind.toUpperCase()
      }

      const aObject = FindOrAddObject(objectId)
      const aPermission = FindOrAddPermission(aObject, permission)
      let aGroup = _.find(aPermission.userGroups, { id: groupId })
      if (!aGroup) {
        aPermission.userGroups.push({ id: groupId, kind: aKind })
      } else {
        aGroup.kind = aKind
      }
      return {
        groupId,
        object: objectId.toLowerCase(),
        permission: permission.toLowerCase(),
        kind: kind.toUpperCase()
      }
    },
    ListACL: () => {
      return aclObject
    },
    ListACLForUser: (userId) => {
      const arr = []
      _.forEach(aclObject, (item) => {
        _.forEach(item.permissions, (perm) => {
          const aUser = _.find(perm.users, { id: userId })
          if (aUser) {
            const ret = { object: item.id, permission: perm.permission, kind: aUser.kind }
            arr.push(ret)
          }
        })
      })
      return arr
    },
    kindAllow,
    kindDeny,
    GuestUserId
  }
}
