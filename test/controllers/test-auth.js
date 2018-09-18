/* eslint-env mocha */
import supertest from 'supertest'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import App from '../../app'
import { ServerNotFound } from '../../config/errors'
import { expected, UserAdmin, createAdminUser, loginAs } from '../services/testutils'

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

  describe('auth/login method', () => {
    beforeEach(function (done) {
      app.models.ClearData()
        .then(() => done())
    })

    describe('should fail with invalid params:', function () {
      it('Empty email', function (done) {
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

      it('No email field', function (done) {
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

      it('No password field', function (done) {
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

      it('Invalid email', function (done) {
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

      it('Invalid password', function (done) {
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
})
