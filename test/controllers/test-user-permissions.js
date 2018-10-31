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
  aclList,
  aclCreate,
  createUser, userPermissions
} from '../client/client-api'

chai.use(dirtyChai)

// test case:
describe('(controller) user-permissions:', function () {
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
      })
      .then(() => {
        context.token = context.adminToken
        return aclCreate(context,
          {
            userId: context.UserFirstId,
            object: 'Invite',
            permission: 'read',
            kind: app.auth.kindAllow
          })
      })
      .then(() => done())
      .catch((err) => {
        done(err)
      })
  })

  describe('list/create method:', function () {
    it('should list permissions in system:', function (done) {
      aclList(context)
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array')
          expect(res.body).to.have.lengthOf(1)
          expect(res.body[0].id).to.exist()
          expect(res.body[0].permissions).to.exist()
          expect(res.body[0].permissions).to.be.an('array')
        })
        .then(() => done())
        .catch((err) => {
          done(err)
        })
    })

    it('should list same permissions for specified user:', function (done) {
      userPermissions(context, context.UserFirstId)
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array')
          expect(res.body).to.have.lengthOf(1)
          expect(res.body[0].object).to.exist()
          expect(res.body[0].permission).to.exist()
          expect(res.body[0].kind).to.exist()
        })
        .then(() => done())
        .catch((err) => {
          done(err)
        })
    })
  })
})
