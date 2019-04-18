/* eslint-env mocha */
import { describe, it, beforeEach, before, after } from 'mocha'
import supertest from 'supertest'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import _ from 'lodash'
import App from '../../app'
import env from 'dotenv-safe'
import {
  createAdminUser,
  inviteCreate,
  loginAs,
  UserAdmin,
  UserFirst,
  UserSecond,
  aclUserList,
  aclUserCreate,
  aclUserGroupCreate,
  aclUserGroupList,
  createUser, userGroupAdd, userGroupUsersAdd, inviteList, expected, userGroupItem
} from '../client/client-api'

chai.use(dirtyChai)

// test case:
describe('(controller) acl:', function () {
  const groupManagers = 'Managers'
  const groupEmployees = 'Employees'

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
        context.request = supertest(app)
        done()
      })
      .catch((err) => {
        done(err)
      })
  })

  after((done) => {
    app.storage.closeStorage()
      .then(() => done())
      .catch(done)
  })

  beforeEach(function (done) {
    app.models.clearData()
      .then(() => app.models.UserGroup.createSystemData())
      .then(() => createAdminUser(context))
      .then((res) => {
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.email).to.exist('res.body.email should exist')
        expect(res.body.id).to.exist('res.body.id should exist')
        context.UserAdminId = res.body.id
        return loginAs(context, UserAdmin)
      })
      .then((res) => {
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.token).to.exist('res.body.token should exist')
        context.adminToken = context.token
        return inviteCreate(context, { email: UserFirst.email })
      })
      .then((res) => {
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.id).to.exist('res.body.id should exist')
        context.userInvite = res.body.id
        return createUser(context, _.merge({}, UserFirst, { invite: context.userInvite }))
      })
      .then((res) => {
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.email).to.exist('res.body.email should exist')
        expect(res.body.id).to.exist('res.body.id should exist')
        context.UserFirstId = res.body.id
        return loginAs(context, UserFirst)
      })
      .then((res) => {
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.token).to.exist('res.body.token should exist')
        context.UserFirstToken = context.token

        // register second user:
        context.token = context.adminToken
        return inviteCreate(context, { email: UserSecond.email })
      })
      .then((res) => {
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.id).to.exist('res.body.id should exist')
        context.userSecondInvite = res.body.id
        return createUser(context, _.merge({}, UserSecond, { invite: context.userSecondInvite }))
      })
      .then((res) => {
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.email).to.exist('res.body.email should exist')
        expect(res.body.id).to.exist('res.body.id should exist')
        context.UserSecondId = res.body.id
        return loginAs(context, UserSecond)
      })
      .then((res) => {
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.token).to.exist('res.body.token should exist')
        context.UserSecondToken = context.token

        context.token = context.adminToken
        return userGroupAdd(context, { name: groupManagers })
      })
      .then((res) => {
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.name).to.exist('res.body.name should exist')
        expect(res.body.id).to.exist('res.body.id should exist')
        expect(res.body.name).to.be.equal(groupManagers)
        context.groupManagersId = res.body.id

        return userGroupAdd(context, { name: groupEmployees })
      })
      .then((res) => {
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.name).to.exist('res.body.name should exist')
        expect(res.body.id).to.exist('res.body.id should exist')
        expect(res.body.name).to.be.equal(groupEmployees)
        context.groupEmployeesId = res.body.id

        // add users to Managers group:
        return userGroupUsersAdd(context, context.groupManagersId, [context.UserAdminId, context.UserFirstId])
      })
      .then(() => userGroupItem(context, context.groupManagersId))
      .then((res) => {
        // console.log('final managers group:')
        // console.log(res.body)
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.id).to.exist('res.body.id should exist')
        expect(res.body.name).to.be.equal(groupManagers)
        expect(res.body.users).to.exist('res.body.users should exist')
        expect(res.body.users).to.be.an('array')
        expect(res.body.users).to.have.lengthOf(2)
      })
      .then(() => done())
      .catch((err) => {
        done(err)
      })
  })

  describe('User methods:', function () {
    it('should list active ACLs for User:', function (done) {
      context.token = context.adminToken

      const aData = {
        object: '/auth/invite',
        permission: 'read',
        'kind': app.consts.kindAllow
      }

      aclUserCreate(context, context.UserFirstId, aData)
        .then(() => aclUserList(context, context.UserFirstId))
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array')
          expect(res.body).to.have.lengthOf(1)
        })
        .then(() => done())
        .catch((err) => {
          done(err)
        })
    })
  })

  describe('UserGroup methods:', function () {
    it('should list active ACLs for UserGroup:', function (done) {
      context.token = context.adminToken

      const aData = {
        object: '/auth/invite',
        permission: 'read',
        kind: app.consts.kindAllow
      }

      aclUserGroupCreate(context, context.groupManagersId, aData)
        .then(() => aclUserGroupList(context, context.groupManagersId))
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array')
          expect(res.body).to.have.lengthOf(1)
        })
        .then(() => done())
        .catch((err) => {
          done(err)
        })
    })

    it('should allow users from specified userGroups to access protected routes:', function (done) {
      context.token = context.adminToken

      const aData = {
        object: '/auth/invite',
        permission: 'read',
        kind: app.consts.kindAllow
      }

      aclUserGroupCreate(context, context.groupManagersId, aData)
        .then(() => {
          context.token = context.UserFirstToken
          return inviteList(context)
        })
        .then(() => done())
        .catch((err) => {
          done(err)
        })
    })

    it('should DENY users from specified userGroups to access protected routes:', function (done) {
      context.token = context.adminToken

      const aData = {
        object: '/auth/invite',
        permission: 'read',
        kind: app.consts.kindAllow
      }

      aclUserGroupCreate(context, context.groupManagersId, aData)
        .then(() => {
          context.token = context.UserSecondToken
          return inviteList(context, expected.ErrCodeForbidden)
        })
        .then(() => done())
        .catch((err) => {
          done(err)
        })
    })
  })
})
