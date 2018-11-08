/* eslint-env mocha */
import { describe, it, beforeEach } from 'mocha'
import supertest from 'supertest'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import _ from 'lodash'
import App from '../../app'
import {
  createAdminUser,
  inviteCreate,
  loginAs,
  UserAdmin,
  UserFirst,
  UserSecond,
  createUser,
  userGroupList, userGroupAdd, userGroupUsersAdd, userGroupUsersRemove, userGroupDelete, userGroupItem
} from '../client/client-api'

chai.use(dirtyChai)

// test case:
describe('(controller) user-group:', function () {
  process.env.NODE_ENV = 'test' // just to be sure
  const app = App()
  const request = supertest(app)

  const context = {
    request,
    apiRoot: '',
    authSchema: 'Bearer',
    adminToken: null,
    userToken: null
  }

  const groupManagers = 'Managers'
  const groupEmployees = 'Employees'
  const groupSome = 'SomeUserGroup'

  beforeEach(function (done) {
    app.models.ClearData()
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

        // create user groups:
        return userGroupAdd(context, { name: groupSome })
      })
      .then((res) => {
        expect(res.body).to.exist('res.body should exist')
        expect(res.body.name).to.exist('res.body.name should exist')
        expect(res.body.id).to.exist('res.body.id should exist')
        expect(res.body.name).to.be.equal(groupSome)
        context.groupSomeId = res.body.id

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

        // create second user
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
        context.userToken = context.token

        // register second user:
        context.token = context.adminToken
        return inviteCreate(context, { email: UserSecond.email, assignUserGroups: [context.groupSomeId] })
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
        context.userSecondToken = context.token

        context.token = context.adminToken
      })
      .then(() => done())
      .catch((err) => {
        done(err)
      })
  })

  describe('list method:', function () {
    it('should list defined user groups', function (done) {
      context.token = context.adminToken
      userGroupList(context)
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array')
          expect(res.body).to.have.lengthOf(6)
        })
        .then(() => done())
        .catch((err) => {
          done(err)
        })
    })
  })

  describe('delete method:', function () {
    it('should delete defined user groups', function (done) {
      context.token = context.adminToken
      userGroupDelete(context, context.groupEmployeesId)
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('object')
          expect(res.body.id).to.exist()
          expect(res.body.id).to.be.equal(context.groupEmployeesId)
          return userGroupDelete(context, context.groupManagersId)
        })
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('object')
          expect(res.body.id).to.exist()
          expect(res.body.id).to.be.equal(context.groupManagersId)

          return userGroupList(context)
        })
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array')
          expect(res.body).to.have.lengthOf(4)
        })
        .then(() => done())
        .catch((err) => {
          done(err)
        })
    })
  })

  describe('usersAdd method:', function () {
    it('should add users to group', function (done) {
      context.token = context.adminToken
      userGroupUsersAdd(context, context.groupManagersId, [context.UserAdminId, context.UserFirstId])
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('object')
          expect(res.body.name).to.exist('Name property should exist')
          expect(res.body.name).to.be.equal(groupManagers)
          expect(res.body.users).to.exist('Users array should exist')
          expect(res.body.users).to.be.an('array')
          expect(res.body.users).to.have.lengthOf(2)
        })
        .then(() => done())
        .catch((err) => {
          done(err)
        })
    })
  })

  describe('usersRemove method:', function () {
    it('should remove users from group', function (done) {
      context.token = context.adminToken
      userGroupUsersAdd(context, context.groupManagersId, [context.UserAdminId, context.UserFirstId])
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('object')
          expect(res.body.name).to.exist('Name property should exist')
          expect(res.body.name).to.be.equal(groupManagers)
          expect(res.body.users).to.exist('Users array should exist')
          expect(res.body.users).to.be.an('array')
          expect(res.body.users).to.have.lengthOf(2)

          return userGroupUsersRemove(context, context.groupManagersId, [context.UserAdminId])
        })
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('object')
          expect(res.body.name).to.exist('Name property should exist')
          expect(res.body.name).to.be.equal(groupManagers)
          expect(res.body.users).to.exist('Users array should exist')
          expect(res.body.users).to.be.an('array')
          expect(res.body.users).to.have.lengthOf(1)
          return userGroupUsersRemove(context, context.groupManagersId, [context.UserFirstId])
        })
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('object')
          expect(res.body.name).to.exist('Name property should exist')
          expect(res.body.name).to.be.equal(groupManagers)
          expect(res.body.users).to.exist('Users array should exist')
          expect(res.body.users).to.be.an('array')
          expect(res.body.users).to.have.lengthOf(0)
        })
        .then(() => done())
        .catch((err) => {
          done(err)
        })
    })
  })
  describe('userGroup.item method and invite assignUserGroups feature:', function () {
    it('should list invited users in specified groups', function (done) {
      context.token = context.adminToken

      userGroupItem(context, context.groupSomeId)
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('object')
          expect(res.body.name).to.exist('Name property should exist')
          expect(res.body.name).to.be.equal(groupSome)
          expect(res.body.users).to.exist('Users array should exist')
          expect(res.body.users).to.be.an('array')
          expect(res.body.users).to.have.lengthOf(1)
          expect(res.body.users[0]).to.be.equal(context.UserSecondId)
        })
        .then(() => done())
        .catch((err) => {
          done(err)
        })
    })
  })
})
