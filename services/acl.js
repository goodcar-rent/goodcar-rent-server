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

export const kindAllow = 'ALLOW'

export const kindDeny = 'DENY'

export const GuestUserId = -1

const aclObject = []

export const CheckPermission = (userId, object, permission) => {
  // check if we have permission for user:
  const aObject = _.find(aclObject, { id: object })
  if (!aObject) {
    return kindDeny // no object defined, DENY
  }

  // find specified permission for object:
  const aPermission = _.find(aObject.permissions, { permission })
  if (!aPermission) {
    return kindDeny // no permission decalration, DENY
  }

  // check if specified object have exact user permission:
  const aUser = _.find(aPermission.users, { userId })
  if (!aUser) {
    return kindDeny
  }
  return aUser.kind
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
  return {
    ACL: (object, permission) => {
      console.log('ACL')
      return (req, res, next) => {
        const auth = app.auth.passport.authenticate('jwt', { session: false })
        auth(req, res, () => {
          console.log('authed')
          if (req.user) {
            console.log('user authenticated')
            // user already authenticated:
            if (CheckPermission(req.user.id, object, permission) === kindAllow) {
              console.log('allowed')
              next()
            } else {
              console.log('not allowed')
              next(new ServerNotAllowed(`Permission check failed: ${object}.${permission}`))
            }
          } else {
            console.log('guest')
            // user not authenticated, check permission for guest user:
            if (CheckPermission(GuestUserId, object, permission) === kindAllow) {
              console.log('ok')
              next()
            } else {
              console.log('xx')
              next(new ServerNotAllowed(`Permission check failed for guest user: ${object}.${permission}`))
            }
          }
        })
      }
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
