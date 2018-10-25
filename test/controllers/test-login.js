/* eslint-env mocha */
import { describe, it, beforeEach } from 'mocha'
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
  createUser
} from '../client/client-api'

chai.use(dirtyChai)

// test case:
describe('login-controller:', function () {
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
})
