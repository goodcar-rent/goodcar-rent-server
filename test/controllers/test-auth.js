/* eslint-env mocha */
import { describe, it, beforeEach } from 'mocha'
import supertest from 'supertest'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import App from '../../app'
import { ServerNotFound } from '../../config/errors'
import {
  expected,
  createAdminUser,
  loginAs,
  createUser,
  inviteCreate,
  UserAdmin,
  UserFirst,
  createUserWithInvite
} from '../client/client-api'

chai.use(dirtyChai)

// test case:
describe('auth-controller:', () => {
  process.env.NODE_ENV = 'test' // just to be sure
  const app = App()
  const request = supertest(app)
  const User = app.models.User

  const context = {
    request,
    apiRoot: '',
    authSchema: 'Bearer'
  }

  describe('login:', () => {
    beforeEach(function (done) {
      app.models.ClearData()
        .then(() => done())
    })

    describe('should fail with invalid params:', function () {
      it('should fail with empty email', function (done) {
        loginAs(context, { email: '', password: '1234' }, expected.ErrCodeInvalidParams)
          .then((res) => {
            expect(res.body).to.exist('Body should exist')
            expect(res.body.message).to.exist('')
            expect(res.body.error).to.exist('')
          })
          .then(() => {
            done()
          })
          .catch((err) => {
            done(err)
          })
      })

      it('should fail without email field', function (done) {
        loginAs(context, { email2: '', password: '1234' }, expected.ErrCodeInvalidParams)
          .then((res) => {
            expect(res.body).to.exist('Body')
            expect(res.body.message).to.exist('body.message')
            expect(res.body.error).to.exist('body.error')
          })
          .then(() => {
            done()
          })
          .catch((err) => {
            done(err)
          })
      })

      it('should fail without password field', function (done) {
        loginAs(context, { email: '1@me.com', password2: '' }, expected.ErrCodeInvalidParams)
          .then((res) => {
            expect(res.body).to.exist('Body')
            expect(res.body.message).to.exist('body.message')
            expect(res.body.error).to.exist('body.error')
          })
          .then(() => {
            done()
          })
          .catch((err) => {
            done(err)
          })
      })

      it('should fail with invalid email', function (done) {
        createAdminUser(context)
          .then(() => loginAs(context, { email: '1@me.com', password: UserAdmin.password }, expected.ErrCodeNotLogged))
          .then((res) => {
            expect(res.body).to.exist('body')
            expect(res.body.message).to.exist('body.message')
            expect(res.body.error).to.exist('body.error')
          })
          .then(() => {
            done()
          })
          .catch((err) => {
            done(err)
          })
      })

      it('should fail with invalid password', function (done) {
        createAdminUser(context)
          .then(() => loginAs(context, { email: UserAdmin.email, password: '123' }, expected.ErrCodeNotLogged))
          .then((res) => {
            expect(res.body).to.exist('body')
            expect(res.body.message).to.exist('body.message')
            expect(res.body.error).to.exist('body.error')
          })
          .then(() => {
            done()
          })
          .catch((err) => {
            done(err)
          })
      })
    })

    it('should fail if internal API would fail', function (done) {
      // mock acl API to always generate exception
      const original = User.findOne
      // eslint-disable-next-line no-unused-vars
      User.findOne = param1 => Promise.reject(new Error('Some error in API'))

      createAdminUser(context)
        .then(() => loginAs(context, UserAdmin, expected.ErrCodeGeneric))
        .then(() => {
          // eslint-disable-next-line no-unused-vars
          User.findOne = param1 => Promise.reject(new ServerNotFound('1', '2', 'Some server error'))

          return loginAs(context, UserAdmin, expected.ErrCodeNotFound)
        })
        .then(() => {
          User.findOne = original
          done()
        })
        .catch((err) => {
          User.findOne = original
          done(err)
        })
    })

    it('should login ok with proper credentials', function (done) {
      createAdminUser(context)
        .then(() => loginAs(context, UserAdmin, expected.Ok))
        .then(() => done())
        .catch(err => done(err))
    })
  })
  describe('signup:', () => {
    beforeEach(function (done) {
      app.models.ClearData()
        .then(() => done())
    })
    it('should fail second sign up if INVITE_ONLY', function (done) {
      createAdminUser(context)
        .then(() => createUser(context, UserFirst, expected.ErrCodeForbidden))
        .then((res) => {
          if (app.env.APP_INVITE_ONLY) {
            expect(res.body).to.exist('body')
            expect(res.body.message).to.exist('body.message')
            expect(res.body.error).to.exist('body.error')
          }
          done()
        })
        .catch((err) => done(err))
    })
    it('should fail if invite email is not matched with signup email', function (done) {
      let invite
      createAdminUser(context)
        .then(() => loginAs(context, UserAdmin))
        .then(() => inviteCreate(context, { email: UserFirst.email }))
        .then((res) => {
          expect(res.body).to.exist()
          expect(res.body.id).to.exist()
          invite = res.body
          return createUser(context,
            {
              email: 'invalid@email.com',
              password: UserFirst.password,
              name: UserFirst.name,
              isAdmin: UserFirst.isAdmin,
              invite: invite.id
            }, expected.ErrCodeForbidden)
        })
        .then((res) => {
          expect(res.body).to.exist('body')
          expect(res.body.message).to.exist('body.message')
          expect(res.body.error).to.exist('body.error')
          done()
        })
        .catch((err) => done(err))
    })
    it('should be ok with proper params', function (done) {
      let invite
      createAdminUser(context)
        .then(() => loginAs(context, UserAdmin))
        .then(() => inviteCreate(context, { email: UserFirst.email }))
        .then((res) => {
          expect(res.body).to.exist()
          expect(res.body.id).to.exist()
          invite = res.body
          return createUser(context,
            {
              email: UserFirst.email,
              password: UserFirst.password,
              name: UserFirst.name,
              isAdmin: UserFirst.isAdmin,
              invite: invite.id
            })
        })
        .then((res) => {
          expect(res.body).to.exist('body')
          expect(res.body.id).to.exist('id')
          expect(res.body.email).is.equal(UserFirst.email)
          expect(res.body.name).is.equal(UserFirst.name)
          done()
        })
        .catch((err) => done(err))
    })
  })
})
