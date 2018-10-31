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
  aclList,
  aclCreate,
  createUser
} from '../client/client-api'

chai.use(dirtyChai)

// test case:
describe('(controller) acl:', function () {
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
        context.adminToken = context.token
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
        context.userSecondToken = context.token
      })
      .then(() => done())
      .catch((err) => {
        done(err)
      })
  })

  describe('create / list method:', function () {
    it('should list active ACLs:', function (done) {
      context.token = context.adminToken

      const aData = {
        userId: context.UserFirstId,
        object: 'Invite',
        permission: 'read',
        'kind': app.auth.kindAllow
      }

      aclCreate(context, aData)
        .then(() => aclList(context))
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
})