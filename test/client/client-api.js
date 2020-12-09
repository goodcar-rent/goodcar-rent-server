import * as ACCESS from '../../src/packages/const-access'

const adminPassword = 'admin12345'
const userPassword = 'user12345'

export const UserAdmin = {
  name: 'John Admin',
  email: 'admin@email.net',
  password: adminPassword,
  isAdmin: true
}

export const UserFirst = {
  name: 'First User',
  email: 'user1@email.net',
  password: `${userPassword}_1`,
  isAdmin: false
}

export const UserSecond = {
  name: 'Second User',
  email: 'user2@email.net',
  password: `${userPassword}_2`,
  isAdmin: false
}

export const expected = {
  Ok: 200,
  OkCreated: 201,
  ErrCodeNotLogged: 401,
  ErrCodeForbidden: 403,
  ErrCodeNotFound: 404,
  ErrCodeInvalidParams: 412,
  ErrCodeError: 500,
  ErrCodeGeneric: 503
}

export const signupUser = (context, user, expectedCode) => context.request.post(`${context.apiRoot}/auth/signup`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.OkCreated)
  .send(user || UserAdmin)

export const loginAs = (context, user, expectedCode) => context.request.post(`${context.apiRoot}/auth/login`)
  .send({
    email: user.email,
    password: user.password
  })
  .type('json')
  .accept('json')
  .accept('text')
  .expect(expectedCode || expected.Ok)
  .then((res) => {
    if (res.body.token) {
      context.token = res.body.token
    }
    return res
  })
  .catch((e) => { throw e })

export const logout = (context, expectedCode) => context.request.get(`${context.apiRoot}/auth/logout`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .accept('text')
  .expect(expectedCode || expected.Ok)

export const meGroups = (context, expectedCode) => context.request.get(`${context.apiRoot}/me/groups`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const meAccess = (context, expectedCode) => context.request.get(`${context.apiRoot}/me/access`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const meGrantAdd = (context, data, expectedCode) => context.request.post(`${context.apiRoot}/me/grant`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send(data)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.OkCreated)

export const inviteCreate = (context, data, expectedCode) => context.request.post(`${context.apiRoot}/auth/invites`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send(data)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const inviteList = (context, expectedCode) => context.request.get(`${context.apiRoot}/auth/invites`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .accept('text')
  .expect(expectedCode || expected.Ok)

export const inviteSend = (context, data, expectedCode) => context.request.get(`${context.apiRoot}/auth/invites/${data.id}/send`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userGroupList = (context, expectedCode) => context.request.get(`${context.apiRoot}/user-groups`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userGroupAdd = (context, data, expectedCode) => context.request.post(`${context.apiRoot}/usergroup`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send(data)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.OkCreated)

export const userGroupItem = (context, groupId, expectedCode) => context.request.get(`${context.apiRoot}/usergroup/${groupId}`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userGroupSave = (context, data, expectedCode) => context.request.put(`${context.apiRoot}/usergroup/${data.id}`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send(data)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userGroupDelete = (context, groupId, expectedCode) => context.request.delete(`${context.apiRoot}/usergroup/${groupId}`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userGroupUsersList = (context, groupId, expectedCode) => context.request.get(`${context.apiRoot}/usergroup/${groupId}/users`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userGroupUsersAdd = (context, groupId, users, expectedCode) => context.request.post(`${context.apiRoot}/usergroup/${groupId}/users`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send(users)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.OkCreated)

export const userGroupUsersRemove = (context, groupId, users, expectedCode) => context.request.delete(`${context.apiRoot}/usergroup/${groupId}/users`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send(users)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const permissionUserGroupList = (context, expectedCode) =>
  context.request.get(`${context.apiRoot}/access/permission-user-group`)
    .set('Authorization', `${context.authSchema} ${context.token}`)
    .type('json')
    .accept('json')
    .expect(expectedCode || expected.Ok)

export const permissionUserGroupCreate = (context, data, expectedCode) =>
  context.request.post(`${context.apiRoot}/access/permission-user-group`)
    .set('Authorization', `${context.authSchema} ${context.token}`)
    .send(data)
    .type('json')
    .accept('json')
    .expect(expectedCode || expected.OkCreated)

export const me = (context, expectedCode) => context.request.get(`${context.apiRoot}/me`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const mePermissions = (context, expectedCode) => context.request.get(`${context.apiRoot}/me/permissions`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userList = (context, expectedCode) => context.request.get(`${context.apiRoot}/users`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userCreate = (context, data, expectedCode) => context.request.post(`${context.apiRoot}/users`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send(data)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userItem = (context, userId, expectedCode) => context.request.get(`${context.apiRoot}/users/${userId}`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userSave = (context, userId, data, expectedCode) => context.request.put(`${context.apiRoot}/users/${userId}`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send(data)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userDelete = (context, userId, expectedCode) => context.request.delete(`${context.apiRoot}/users/${userId}`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userPermissions = (context, userId, expectedCode) => context.request.get(`${context.apiRoot}/users/${userId}/permissions`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const noteList = (context, expectedCode) => context.request.get(`${context.apiRoot}/note`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const noteListOpt = (context, opt, expectedCode) => {
  let filter = null

  if (opt && opt.filter) {
    filter = `?filter=${JSON.stringify(opt.filter)}`
  }

  return context.request.get(`${context.apiRoot}/note${filter}`)
    .set('Authorization', `${context.authSchema} ${context.token}`)
    .type('json')
    .accept('json')
    .expect(expectedCode || expected.Ok)
}

export const noteAdd = (context, data, expectedCode) => context.request.post(`${context.apiRoot}/note`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send(data)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.OkCreated)

export const noteSave = (context, aId, data, expectedCode) => context.request.put(`${context.apiRoot}/note/${aId}`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send(data)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const createAdmin = (context) => {
  if (!context) throw new Error('context param missing')

  return signupUser(context, UserAdmin)
    .then((res) => {
      context.adminId = res.body.id
      return loginAs(context, UserAdmin)
    })
    .then((res) => {
      context.adminToken = res.body.token
      context.token = context.adminToken
      return res
    })
    .catch((e) => { throw e })
}

export const setAdminToken = (context) => {
  if (!context) throw new Error('context param missing')

  context.token = context.adminToken
}

export const setUserFirstToken = (context) => {
  if (!context) throw new Error('context param missing')
  context.token = context.userFirstToken
}
/**
   * сниппет для теста - создать пользователя UserFirst
   */
export const createUserFirst = (context) => {
  if (!context) throw new Error('context param missing')

  setAdminToken(context)
  return signupUser(context, UserFirst)
    .then((res) => {
      context.userFirstId = res.body.id
      return loginAs(context, UserFirst)
    })
    .then((res) => {
      context.userFirstToken = res.body.token
      setAdminToken(context)
      return res
    })
    .catch((e) => { throw e })
}

export const createUserSecond = (context) => {
  if (!context) throw new Error('context param missing')

  setAdminToken(context)
  return signupUser(context, UserSecond)
    .then((res) => {
      context.userSecondId = res.body.id
      return loginAs(context, UserSecond)
    })
    .then((res) => {
      context.userSecondToken = res.body.token
      setAdminToken(context)
      return res
    })
    .catch((e) => { throw e })
}

export const createGroupManagers = (context) => {
  if (!context) throw new Error('context param missing')

  setAdminToken(context)
  return userGroupAdd(context, { name: 'Managers' })
    .then((res) => {
      context.groupManagers = res.body.id
      return res
    })
    .catch((e) => { throw e })
}

export const createPermsForNoteForGroup = (groupId) => {
  return [
    {
      userGroupId: groupId,
      accessObjectId: 'Note.list',
      permission: ACCESS.AccessPermissionType.ALLOW.value
    },
    {
      userGroupId: groupId,
      accessObjectId: 'Note.item',
      permission: ACCESS.AccessPermissionType.ALLOW.value
    },
    {
      userGroupId: groupId,
      accessObjectId: 'Note.create',
      permission: ACCESS.AccessPermissionType.ALLOW.value
    },
    {
      userGroupId: groupId,
      accessObjectId: 'Note.remove',
      permission: ACCESS.AccessPermissionType.ALLOW.value
    },
    {
      userGroupId: groupId,
      accessObjectId: 'Note.removeAll',
      permission: ACCESS.AccessPermissionType.ALLOW.value
    }
  ]
}
export const createPermsForNoteForManagers = (context) => {
  if (!context) throw new Error('context param missing')

  return permissionUserGroupCreate(context, createPermsForNoteForGroup(context.groupManagers))
    .catch((e) => { throw e })
}
