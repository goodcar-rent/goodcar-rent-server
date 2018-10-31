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
  Deleted: 204,
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

export const inviteCreate = (context, data, expectedCode) => context.request.post(`${context.apiRoot}/auth/invite`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send(data)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const inviteList = (context, expectedCode) => context.request.get(`${context.apiRoot}/auth/invite`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .accept('text')
  .expect(expectedCode || expected.Ok)

export const inviteSend = (context, data, expectedCode) => context.request.get(`${context.apiRoot}/auth/invite/${data.id}/send`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userGroupList = (context, expectedCode) => context.request.get(`${context.apiRoot}/user-group`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userGroupUsersList = (context, groupId, expectedCode) => context.request.get(`${context.apiRoot}/user-group/${groupId}/users`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userGroupUsersAdd = (context, groupId, users, expectedCode) => context.request.post(`${context.apiRoot}/user-group/${groupId}/users`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send(users)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const userGroupUsersRemove = (context, groupId, users, expectedCode) => context.request.delete(`${context.apiRoot}/user-group/${groupId}/users`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .send(users)
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
  .expect(expectedCode || expected.Deleted)

export const aclList = (context, expectedCode) => context.request.get(`${context.apiRoot}/acl/object`)
  .set('Authorization', `${context.authSchema} ${context.token}`)
  .type('json')
  .accept('json')
  .expect(expectedCode || expected.Ok)

export const aclCreate = (context, data, expectedCode) => context.request.post(`${context.apiRoot}/acl/object`)
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
