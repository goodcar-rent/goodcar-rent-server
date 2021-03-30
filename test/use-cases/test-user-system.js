/* eslint-env mocha */
import { describe, it, before, beforeEach, after } from 'mocha'
import supertest from 'supertest'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import env from 'dotenv-safe'
import _ from 'lodash'

import App from '../../src/packages/server-bricks'

import {
  UserAdmin,
  UserFirst,
  UserSecond,
  expected,
  // UserFirst,
  // userList,
  loginAs,
  signupUser,
  meGroups,
  userGroupAdd,
  userGroupUsersAdd,
  permissionUserGroupCreate,
  noteAdd,
  noteSave,
  userGroupUsersList,
  userGroupUsersRemove,
  meGrantAdd,
  noteList,
  meAccess,
  me,
  createAdmin,
  createGroupManagers,
  createUserFirst,
  createPermsForNoteForManagers,
  setAdminToken,
  setUserFirstToken,
  createUserSecond
  // userDelete,
  // userSave
} from '../client/client-api'
import * as ACCESS from '../../src/packages/const-access'
import { ExtTest } from '../../src/ext-test/ext-test'

/**

*/

chai.use(dirtyChai)

// test case:
describe('exModular: storage', function () {
  env.config()
  process.env.NODE_ENV = 'test' // just to be sure
  let app = null

  const context = {
    request: null,
    apiRoot: '',
    authSchema: 'Bearer',
    adminToken: null,
    userToken: null
  }

  before((done) => {
    App()
      .then((a) => {
        app = a
        ExtTest(app)
      })
      .then(() => app.exModular.storages.Init()) // init storages
      .then(() => app.exModular.modelsInit())
      .then(() => {
        app.exModular.routes.builder.forAllModels()
        return app.exModular.routes.builder.generateRoutes()
      })
      .then(() => app.exModular.initAll())
      .then(() => {
        context.request = supertest(app)
        done()
      })
      .catch(done)
  })

  after((done) => {
    app.exModular.storages.Close()
      .then(() => done())
      .catch(done)
  })

  beforeEach((done) => {
    app.exModular.storages.Clear()
      .then(() => done())
      .catch(done)
  })

  /* Test plan:

  u-s-1: Создать первого пользователя:
    1-c1: проверить что аккаунт успешно создан
    1-c2: проверить что получен токен
    1-c3: проверить что он администратор

  u-s-2: Создать пользовательские группы:
    2-1 группа "менеджеры":
      2-1-c1: проверить что группа создана
    2-2: группа "сотрудники":
      2-2-c1: проверить что группа создана

  u-s-3: Создать два новых пользователя:
   3-1: первый пользователь
    3-1-c1: пользователь создан успешно
    3-1-c2: можно входить в систему под этим пользователем
   3-2: второй пользователь
    3-2-c1: пользователь создан успешно
    3-2-c2: можно входить в систему под этим пользователем

  u-s-4: проверить, что от имени пользователя нельзя создать группу:
    4-1: первого пользователя
      4-1-c1: ожидать ошибку
    4-2: второго  пользователя
      4-1-c1: ожидать ошибку

  u-s-5: добавить пользователей в группу:
    5-1: создать группу менеджеров и добавить туда первого пользователя

  u-s-6: дать доступ от администратора на объект Note:
    6-1: группе менеджеров - на чтение и запись, с правом передоверия
    6-2: группе сотрудников - на чтение

Дать доступ к ресурсу Заметки группе менеджеров на запись с правом передоверия.

Добавить первого пользователя к менеджерам.

Добавить второго пользователя к сотрудникам.

Проверить что первый и второй пользователь могут получить доступ к Заметкам на чтение.

Проверить что сотрудник не имеет прав на создание записи.

Проверить что мегеджер имеет право на создание записи.
   */

  /**
   * сниппет для теста - создать пользователя Admin
   */

  describe('exModular: storage', function () {
    it('s-1: storage.update:', function () {
      return createAdmin(context)
        .then(() => noteAdd(context, { caption: '1' }))
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('object')
          expect(res.body.caption).to.exist()
          expect(res.body.caption).to.be.equal('1')
          expect(res.body.description).to.exist()
          expect(res.body.description).to.be.equal('')
          context.noteId = res.body.id
          return noteSave(context, context.noteId, { description: '2' })
        })
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('object')
          expect(res.body.caption).to.exist()
          expect(res.body.caption).to.be.equal('1')
          expect(res.body.description).to.exist()
          expect(res.body.description).to.be.equal('2')

          return noteSave(context, context.noteId, { id: '42', description: '3' })
        })
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('object')
          expect(res.body.id).to.exist()
          expect(res.body.id).to.be.equal('42')
          expect(res.body.caption).to.exist()
          expect(res.body.caption).to.be.equal('1')
          expect(res.body.description).to.exist()
          expect(res.body.description).to.be.equal('3')
        })
        .catch((e) => { throw e })
    })
    it('s-2: storage.refs: add, list, remove methods test', function () {
      return createAdmin(context)
        .then(() => createGroupManagers(context))
        .then(() => createUserFirst(context))
        .then(() => userGroupUsersAdd(context, context.groupManagers, [context.userFirstId, context.adminId]))
        .then((res) => {
          // 2-c1:
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array').that.have.lengthOf(2)
          return userGroupUsersList(context, context.groupManagers)
        })
        .then((res) => {
          // 2-c2:
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array').that.have.lengthOf(2)
          expect(res.body).to.include(context.userFirstId)
          expect(res.body).to.include(context.adminId)

          return userGroupUsersRemove(context, context.groupManagers, [context.userFirstId])
        })
        .then((res) => {
          // 2-c3:
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array').that.have.lengthOf(1)
          expect(res.body).not.to.include(context.userFirstId)
          expect(res.body).to.include(context.adminId)

          return userGroupUsersRemove(context, context.groupManagers, [context.adminId])
        })
        .then((res) => {
          // 2-c4:
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array').that.have.lengthOf(0)
        })
        .catch((e) => { throw e })
    })
  })

  describe('exModular: user system', function () {
    it('u-s-1: register first user account', function () {
      return signupUser(context, UserAdmin)
        .then((res) => {
          // 1-c1: user account created ok
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('object')
          expect(res.body.email).to.exist()
          expect(res.body.email).to.be.equal(UserAdmin.email)
          return loginAs(context, UserAdmin)
        })
        .then((res) => {
          // 1-c2: we have some token
          expect(res.body).to.exist('res.body should exist')
          expect(res.body.token).to.exist('res.body.token should exist')

          context.adminToken = res.body.token

          setAdminToken(context)
          return meGroups(context)
        })
        .then((res) => {
          // 1-c3: user is admin
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array').that.not.empty()
          const _adminGroupNdx = _.findIndex(res.body, (item) => item.id === ACCESS.ADMIN_GROUP_ID)
          expect(_adminGroupNdx).not.equal(-1)
        })
        .catch((e) => { throw e })
    })

    describe('u-s-2: create user groups', function () {
      it('2-1: Managers group', function () {
        return createAdmin(context)
          .then(() => userGroupAdd(context, { name: 'Managers' }))
          .then((res) => {
            // 2-1-c1: check if group created ok
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('object')
            expect(res.body.id).to.exist()
            expect(res.body.name).to.be.equal('Managers')

            context.groupManagers = res.body.id
          })
          .catch((e) => { throw e })
      })
      it('2-2: Employee group', function () {
        return createAdmin(context)
          .then(() => userGroupAdd(context, { name: 'Employee' }))
          .then((res) => {
            // 2-2-c1: check if group created ok
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('object')
            expect(res.body.id).to.exist()
            expect(res.body.name).to.be.equal('Employee')

            context.groupEmployee = res.body.id
          })
          .catch((e) => { throw e })
      })
    })

    describe('u-s-3: create users', function () {
      it('3-1: UserFirst', function () {
        // context.token = context.adminToken
        return signupUser(context, UserFirst)
          .then((res) => {
            // 3-1-c1: check if user created ok
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('object')
            expect(res.body.id).to.exist()
            expect(res.body.name).to.be.equal(UserFirst.name)
            expect(res.body.email).to.be.equal(UserFirst.email)

            return loginAs(context, UserFirst)
          })
          .then((res) => {
            // 3-1-c2: check if we can login as that user
            expect(res.body).to.exist('res.body should exist')
            expect(res.body.token).to.exist('res.body.token should exist')
            context.userFirstToken = res.body.token
          })
          .catch((e) => { throw e })
      })
      it('3-2: UserSecond', function () {
        // context.token = context.adminToken
        return signupUser(context, UserSecond)
          .then((res) => {
            // 3-2-c1: check if user created ok
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('object')
            expect(res.body.id).to.exist()
            expect(res.body.name).to.be.equal(UserSecond.name)
            expect(res.body.email).to.be.equal(UserSecond.email)

            return loginAs(context, UserSecond)
          })
          .then((res) => {
            // 3-2-c2: check if we can login as that user
            expect(res.body).to.exist('res.body should exist')
            expect(res.body.token).to.exist('res.body.token should exist')
            context.UserSecond = res.body.token
          })
          .catch((e) => { throw e })
      })
    })

    describe('u-s-4: not-admin user can not create user group', function () {
      it('4-1: UserFirst can not create user group', function () {
        return signupUser(context, UserAdmin)
          .then(() => signupUser(context, UserFirst))
          .then(() => loginAs(context, UserFirst))
          .then((res) => {
            expect(res.body).to.exist('res.body should exist')
            expect(res.body.token).to.exist('res.body.token should exist')
            context.userFirstToken = res.body.token
            setUserFirstToken(context)
            return userGroupAdd(context, { name: 'Some group name' }, expected.ErrCodeForbidden)
          })
          .then((res) => {
            // 3-1-c1: check if user created ok
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('object')
            expect(res.body.err).to.exist()
          })
          .catch((e) => { throw e })
      })

      it('4-2: UserSecond can not create user group', function () {
        return signupUser(context, UserAdmin)
          .then(() => signupUser(context, UserSecond))
          .then(() => loginAs(context, UserSecond))
          .then((res) => {
            expect(res.body).to.exist('res.body should exist')
            expect(res.body.token).to.exist('res.body.token should exist')
            context.UserSecond = res.body.token
            context.token = context.UserSecond
            return userGroupAdd(context, { name: 'Some group name' }, expected.ErrCodeForbidden)
          })
          .then((res) => {
            // 3-1-c1: check if user created ok
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('object')
            expect(res.body.err).to.exist()
          })
          .catch((e) => { throw e })
      })
    })

    describe('u-s-5: create user groups and add users to groups', function () {
      it('5-1: add Managers group and UserFirst to that group', function () {
        return createAdmin(context)
          .then(() => createGroupManagers(context))
          .then((res) => {
            // 5-1-c1: check if group created ok
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('object')
            expect(res.body.id).to.exist()
            expect(res.body.name).to.be.equal('Managers')

            context.groupManagers = res.body.id

            // create user
            return signupUser(context, UserFirst)
          })
          .then((res) => {
            // 5-1-c2:
            expect(res.body).to.exist('res.body should exist')
            expect(res.body.id).to.exist('res.body.id should exist')

            context.userFirstId = res.body.id
            return loginAs(context, UserFirst)
          })
          .then((res) => {
            // 5-1-c2:
            expect(res.body).to.exist('res.body should exist')
            expect(res.body.token).to.exist('res.body.token should exist')
            context.userFirstToken = res.body.token

            setAdminToken(context)
            return userGroupUsersAdd(context, context.groupManagers, [context.userFirstId])
          })
          .then((res) => {
            // 5-1-c4: users are added to group:
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('array').that.have.lengthOf(1)
            setUserFirstToken(context)
            return meGroups(context)
          })
          .then((res) => {
            // 5-1-c5: check that group is added to user's profile:
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('array').that.have.lengthOf(2)
          })
          .catch((e) => { throw e })
      })
    })

    describe('u-s-6: admin user delegate permissions to Note object', function () {
      it('6-1: add permission for Managers group - read/write', function () {
        return createAdmin(context)
          .then(() => createGroupManagers(context))
          .then(() => createPermsForNoteForManagers(context))
          .then((res) => {
            // 6-1-c2: permissions has been added
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('array').that.have.lengthOf(5)
            expect(res.body.err).to.not.exist()

            // create user
            return createUserFirst(context)
          })
          .then(() => {
            setAdminToken(context)

            return userGroupUsersAdd(context, context.groupManagers, [context.userFirstId])
          })
          .then(() => {
            setUserFirstToken(context)

            return noteAdd(context, { caption: 'some note' })
          })
          .then((res) => {
            // 6-1-c3: note has been added
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('object').that.have.property('id')
            expect(res.body).have.property('caption')
            expect(res.body).have.property('description')
            expect(res.body.err).to.not.exist()
          })
          .catch((e) => { throw e })
      })
      it('6-2: add permission for Employees group - read only', function () {
        return createAdmin(context)
          .then(() => {
            setAdminToken(context)
            return userGroupAdd(context, { name: 'Employee' })
          })
          .then((res) => {
            // 6-2-c1: check if group created ok
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('object')
            expect(res.body.id).to.exist()
            expect(res.body.name).to.be.equal('Employee')

            context.groupEmployee = res.body.id

            const perms = [
              { userGroupId: context.groupEmployee, accessObjectId: 'Note.list', permission: ACCESS.AccessPermissionType.ALLOW.value },
              { userGroupId: context.groupEmployee, accessObjectId: 'Note.item', permission: ACCESS.AccessPermissionType.ALLOW.value }
            ]
            return permissionUserGroupCreate(context, perms)
          })
          .then((res) => {
            // 6-2-c2: permissions has been added
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('array').that.have.lengthOf(2)
            expect(res.body.err).to.not.exist()

            // create user
            return createUserFirst(context)
          })
          .then(() => {
            setAdminToken(context)

            return userGroupUsersAdd(context, context.groupEmployee, [context.userFirstId])
          })
          .then(() => {
            setUserFirstToken(context)

            return noteAdd(context, { caption: 'some note' }, expected.ErrCodeForbidden)
          })
          .then((res) => {
            // 6-2-c3: note can not be added - forbidden
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('object')
            expect(res.body.err).to.exist()
          })
          .catch((e) => { throw e })
      })
      it('6-3: grant permissions to other user', function () {
        return createAdmin(context)
          .then(() => createGroupManagers(context))
          .then(() => {
            const perms = [
              { userGroupId: context.groupManagers, accessObjectId: 'Note.list', permission: ACCESS.AccessPermissionType.ALLOW.value, withGrant: true },
              { userGroupId: context.groupManagers, accessObjectId: 'Note.item', permission: ACCESS.AccessPermissionType.ALLOW.value, withGrant: true },
              { userGroupId: context.groupManagers, accessObjectId: 'Note.create', permission: ACCESS.AccessPermissionType.ALLOW.value, withGrant: false },
              { userGroupId: context.groupManagers, accessObjectId: 'Note.remove', permission: ACCESS.AccessPermissionType.ALLOW.value, withGrant: false },
              { userGroupId: context.groupManagers, accessObjectId: 'Note.removeAll', permission: ACCESS.AccessPermissionType.ALLOW.value, withGrant: false }
            ]

            return permissionUserGroupCreate(context, perms)
          })
          .then(() => {
            // create user 1
            return createUserFirst(context)
          })
          .then(() => {
            setAdminToken(context)
            return userGroupUsersAdd(context, context.groupManagers, [context.userFirstId])
          })
          .then(() => {
            setUserFirstToken(context)
            return noteAdd(context, { caption: 'some note' })
          })
          .then(() => {
            // 6-1-c3: note were added

            setAdminToken(context)
            return createUserSecond(context)
          })
          .then(() => {
            context.token = context.userSecondToken
            return noteList(context, expected.ErrCodeForbidden)
          })
          .then((res) => {
            // 6-1-c1: note cannot be listed
            expect(res.body).to.exist('Body should exist')
            expect(res.body.err).to.exist()

            setUserFirstToken(context)
            return meGrantAdd(
              context,
              {
                userId: context.userSecondId,
                accessObjectId: 'Note.list',
                permission: ACCESS.ALLOW,
                withGrant: false
              })
          })
          .then((res) => {
            // 6-3-c2: grant was added
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('object').that.have.property('id')
            expect(res.body).have.property('accessObjectId')
            expect(res.body).have.property('permissionUser')
            expect(res.body.permissionUser).to.be.an('object').that.have.property('id')
            expect(res.body.err).to.not.exist()

            context.token = context.userSecondToken
            return noteList(context)
          })
          .then((res) => {
            // 6-1-c3: note were added
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('array')
            expect(res.body.err).to.not.exist()

            // try to add grant to permission that have withGrant=false
            setUserFirstToken(context)
            return meGrantAdd(
              context,
              {
                userId: context.userSecondId,
                accessObjectId: 'Note.create',
                permission: ACCESS.ALLOW,
                withGrant: false
              }, expected.ErrCodeForbidden)
          })
          .then((res) => {
            // 6-3-c4: grant was NOT added
            expect(res.body).to.exist('Body should exist')
            expect(res.body.err).to.exist()
          })

          .catch((e) => { throw e })
      })
    })
    describe('u-s-7: Me routes', function () {
      it('7-1: me access', function () {
        return createAdmin(context)
          .then(() => createGroupManagers(context))
          .then(() => createPermsForNoteForManagers(context))
          .then(() => createUserFirst(context))
          .then(() => {
            setAdminToken(context)
            return userGroupUsersAdd(context, context.groupManagers, [context.userFirstId])
          })
          .then(() => {
            setUserFirstToken(context)
            return meAccess(context)
          })
          .then((res) => {
            // 7-1-c1: access object has been returned
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('array').that.have.lengthOf(18)
            expect(res.body.err).to.not.exist()
            expect(res.body[0]).to.have.property('id')
            expect(res.body[0]).to.have.property('permission')
            expect(res.body[0]).to.have.property('isAdmin')
            expect(res.body[0]).to.have.property('error')
            expect(res.body[0]).to.have.property('permissionUserId')
            expect(res.body[0]).to.have.property('permissionUserGroupId')
          })
          .catch((e) => { throw e })
      })
      it('7-2: me groups', function () {
        return createAdmin(context)
          .then(() => createGroupManagers(context))
          .then(() => createPermsForNoteForManagers(context))
          .then(() => createUserFirst(context))
          .then(() => {
            setAdminToken(context)
            return userGroupUsersAdd(context, context.groupManagers, [context.userFirstId])
          })
          .then(() => {
            setUserFirstToken(context)
            return meGroups(context)
          })
          .then((res) => {
            // 7-1-c1: access object has been returned
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('array').that.have.lengthOf(2)
            expect(res.body.err).to.not.exist()
            expect(res.body[0]).to.have.property('id')
            expect(res.body[0]).to.have.property('name')
            expect(res.body[0]).to.have.property('systemType')
            expect(res.body[0]).not.to.have.property('users')
          })
          .then(() => {
            setAdminToken(context)

            return meGroups(context)
          })
          .then((res) => {
            // 7-1-c1: access object has been returned
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('array').that.have.lengthOf(2)
            expect(res.body[0]).to.have.property('id')
            expect(res.body[0]).to.have.property('name')
            expect(res.body[0]).to.have.property('systemType')
            expect(res.body[0]).not.to.have.property('users')
            expect(res.body.err).to.not.exist()
          })
          .catch((e) => { throw e })
      })
      it('7-3: me', function () {
        return createAdmin(context)
          .then(() => createGroupManagers(context))
          .then(() => createPermsForNoteForManagers(context))
          .then(() => createUserFirst(context))
          .then(() => {
            setAdminToken(context)

            return userGroupUsersAdd(context, context.groupManagers, [context.userFirstId])
          })
          .then(() => {
            setUserFirstToken(context)

            return me(context)
          })
          .then((res) => {
            // 7-3-c1: me object should be returned for simple user
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('object')
            expect(res.body.err).to.not.exist()
            expect(res.body).to.have.property('id')
            expect(res.body).to.have.property('name')
            expect(res.body).to.have.property('email')
            expect(res.body).not.to.have.property('password')
            expect(res.body).not.to.have.property('adminGroupId')
            expect(res.body).not.to.have.property('loggedGroupId')

            setAdminToken(context)

            return me(context)
          })
          .then((res) => {
            // 7-3-c2: me object should be returned for admin user
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('object')
            expect(res.body.err).to.not.exist()
            expect(res.body).to.have.property('id')
            expect(res.body).to.have.property('name')
            expect(res.body).to.have.property('email')
            expect(res.body).not.to.have.property('password')
            expect(res.body).to.have.property('adminGroupId')
            expect(res.body).to.have.property('loggedGroupId')
          })
          .catch((e) => { throw e })
      })
    })

    describe('u-s-8: Model hooks', function () {
      it('8-1: refs - after remove hook', function () {
        return createAdmin(context)
          .then(() => createUserFirst(context))
          .then(() => createUserSecond(context))
          .then(() => {
            setAdminToken(context)

            return me(context)
          })
          .then((res) => {
            const loggedGroupId = res.body.loggedGroupId

            return userGroupUsersRemove(context, loggedGroupId, [context.userFirstId, context.userSecondId])
          })
          .then((res) => {
            // 7-1-c1: access object has been returned
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('array').that.have.lengthOf(1)
            expect(res.body.err).to.not.exist()
          })
          .catch((e) => { throw e })
      })
    })
  })
})
