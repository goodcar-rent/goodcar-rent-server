/* eslint-env mocha */
import { describe, it, beforeEach, before } from 'mocha'
import supertest from 'supertest'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import App from '../../app'
import {
  createAdminUser,
  inviteCreate,
  loginAs,
  UserAdmin,
  UserFirst,
  loginList,
  createUser, loginItem, loginDelete, userGroupList, expected
} from '../client/client-api'
import env from 'dotenv-safe'

chai.use(dirtyChai)

// test case:
describe('(controller) login:', function () {
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
      .then(() => loginAs(context, UserAdmin))
      .then((res) => {
        expect(res.body).to.exist()
        expect(res.body.token).to.exist()
        context.adminToken = context.token
        return inviteCreate(context, { email: UserFirst.email })
      })
      .then((res) => {
        expect(res.body).to.exist()
        expect(res.body.id).to.exist()
        context.userInvite = res.body.id
        UserFirst.invite = context.userInvite
        return createUser(context, UserFirst)
      })
      .then((res) => {
        expect(res.body).to.exist()
        expect(res.body.email).to.exist()
        return loginAs(context, UserFirst)
      })
      .then((res) => {
        expect(res.body).to.exist()
        expect(res.body.token).to.exist()
        context.userToken = context.token
      })
      .then(() => done())
      .catch((err) => done(err))
  })

  describe('list method:', function () {
    it('should list current active logins:', function (done) {
      context.token = context.adminToken
      loginList(context)
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array')
          expect(res.body).to.have.lengthOf(2)
        })
        .then(() => done())
        .catch((err) => done(err))
    })
  })

  describe('item method:', function () {
    it('should get details about specified login:', function (done) {
      context.token = context.adminToken
      loginList(context)
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array')
          expect(res.body).to.have.lengthOf(2)
          return loginItem(context, { id: res.body[0].id })
        })
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('object')
          expect(res.body.id).to.exist()
          expect(res.body.userId).to.exist()
          expect(res.body.ip).to.exist()
        })
        .then(() => done())
        .catch((err) => done(err))
    })
  })

  describe('delete method:', function () {
    it('should delete active session and make token invalid:', function (done) {
      context.token = context.adminToken
      loginList(context)
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array')
          expect(res.body).to.have.lengthOf(2)
          return loginDelete(context, { id: res.body[1].id })
        })
        .then(() => {
          context.token = context.userToken
          return userGroupList(context, expected.ErrCodeForbidden)
        })
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('object')
          expect(res.body.error).to.exist('Error should exist')
        })
        .then(() => done())
        .catch((err) => done(err))
    })
  })
})
