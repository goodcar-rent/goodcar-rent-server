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
  ErrCodeNotLogged: 401,
  ErrCodeForbidden: 403,
  ErrCodeNotFound: 404,
  ErrCodeInvalidParams: 412,
  ErrCodeError: 500,
  ErrCodeGeneric: 503
}

export const createAdminUser = context => context.request.post(`${context.apiRoot}/auth/signup`)
  .send(UserAdmin)
  .type('json')
  .accept('json')
  .accept('text')
  .expect(expected.Ok)

export const createUser = (context, user, expectedCode) => context.request.post(`${context.apiRoot}/auth/signup`)
  .send(user || UserFirst)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

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

export const logout = (context, expectedCode) => context.request.get(`${context.apiRoot}/auth/logout`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .accept('text')
  .expect(expectedCode || expected.Ok)

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

export const userGroupAdd = (context, data, expectedCode) => context.request.post(`${context.apiRoot}/user-groups`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send(data)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userGroupItem = (context, groupId, expectedCode) => context.request.get(`${context.apiRoot}/user-groups/${groupId}`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userGroupSave = (context, data, expectedCode) => context.request.put(`${context.apiRoot}/user-groups/${data.id}`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send(data)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userGroupDelete = (context, groupId, expectedCode) => context.request.delete(`${context.apiRoot}/user-groups/${groupId}`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userGroupUsersList = (context, groupId, expectedCode) => context.request.get(`${context.apiRoot}/user-groups/${groupId}/users`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userGroupUsersAdd = (context, groupId, users, expectedCode) => context.request.post(`${context.apiRoot}/user-groups/${groupId}/users`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send({ users })
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userGroupUsersRemove = (context, groupId, users, expectedCode) => context.request.delete(`${context.apiRoot}/user-groups/${groupId}/users`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send({ users })
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const loginList = (context, expectedCode) => context.request.get(`${context.apiRoot}/login`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const loginItem = (context, data, expectedCode) => context.request.get(`${context.apiRoot}/login/${data.id}`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const loginDelete = (context, data, expectedCode) => context.request.delete(`${context.apiRoot}/login/${data.id}`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const aclUserList = (context, userId, expectedCode) => context.request.get(`${context.apiRoot}/acl/user-acls/${userId}`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const aclUserCreate = (context, userId, data, expectedCode) => context.request.post(`${context.apiRoot}/acl/user-acls/${userId}`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send(data)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const aclUserGroupList = (context, groupId, expectedCode) =>
  context.request.get(`${context.apiRoot}/acl/user-group-acls/${groupId}`)
    .set('Authorization', `${context.authSchema} ${context.token}`)
    .type('json')
    .accept('json')
    .expect(expectedCode || expected.Ok)

export const aclUserGroupCreate = (context, groupId, data, expectedCode) =>
  context.request.post(`${context.apiRoot}/acl/user-group-acls/${groupId}`)
    .set('Authorization', `${context.authSchema} ${context.token}`)
    .send(data)
    .type('json')
    .accept('json')
    .expect(expectedCode || expected.Ok)

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
