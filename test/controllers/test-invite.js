/* eslint-env mocha */
import supertest from 'supertest'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import App from '../../app'
import { expected, createAdminUser, inviteCreate, inviteList, loginAs, UserAdmin } from '../services/testutils'
import Moment from 'moment'

chai.use(dirtyChai)

// test case:
describe('invite-controller:', function () {
  process.env.NODE_ENV = 'test' // just to be sure
  const app = App()
  const request = supertest(app)

  const context = {
    request,
    apiRoot: '',
    authSchema: 'Bearer'
  }

  beforeEach(function (done) {
    app.models.ClearData()
      .then(() => createAdminUser(context))
      .then(() => loginAs(context, UserAdmin))
      .then(() => done())
  })

  describe('create method:', function () {
    describe('should fail with invalid params:', function () {
      it('Empty email', function (done) {
        inviteCreate(context, {email: ''}, expected.ErrCodeInvalidParams)
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
      it('Empty email', function (done) {
        inviteCreate(context, {email: ''}, expected.ErrCodeInvalidParams)
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
    })

    describe('should be ok with proper params:', function () {
      const aMoment = (Moment(Date.now() + 1 * 1000 * 60 * 60 * 24)).format('YYYY-MM-DD')
      console.log(aMoment)

      it('should be ok with email only', function (done) {
        inviteCreate(context, { email: 'user@email.com' })
          .then(() => inviteList(context))
          .then(() => done())
          .catch((err) => {
            done(err)
          })
      })
      it('should be ok with email and expireAt only', function (done) {
        inviteCreate(context, { email: 'user@email.com', expireAt: aMoment })
          .then(() => inviteList(context))
          .then(() => done())
          .catch((err) => {
            done(err)
          })
      })
      it('should be ok with full pack - email, expireAt and disabled', function (done) {
        inviteCreate(context, { email: 'user@email.com', expireAt: aMoment, disabled: true })
          .then(() => inviteList(context))
          .then(() => done())
          .catch((err) => {
            done(err)
          })
      })
    })
  })
})
