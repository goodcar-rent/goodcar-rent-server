/**

 exModular project

 Test module

 Core test for exModular project

*/

/* eslint-env mocha */
import { describe, it, before, beforeEach, after } from 'mocha'
import supertest from 'supertest'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import chaiAsPromised from 'chai-as-promised'
import env from 'dotenv-safe'
import _ from 'lodash'

import App from '../../src/packages/app-builder'

import {
  loginAs,
  UserAdmin,
  signupUser,
  noteListOpt
} from '../client/client-api'
// import { ExtTest } from '../../src/ext-test/ext-test'
import { ExtTest } from '../../src/ext-test/ext-test'
// import * as ACCESS from '../../src/packages/const-access'

chai.use(dirtyChai)
chai.use(chaiAsPromised)

// test case:
describe('exModular: controller', function () {
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

  describe('1: filter', function () {
    it('1-1: one-field single-value', function () {
      return signupUser(context, UserAdmin)
        .then(() => loginAs(context, UserAdmin))
        .then((res) => {
          context.adminToken = res.body.token
          context.token = context.adminToken
          return noteListOpt(context, { filter: { id: '2' } })
        })
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array').that.have.lengthOf(1)
          expect(res.body[0].id).to.be.equal('2')
        })
        .catch((e) => { throw e })
    })
    it('1-2: one-field multiply values', function () {
      return signupUser(context, UserAdmin)
        .then(() => loginAs(context, UserAdmin))
        .then((res) => {
          context.adminToken = res.body.token
          context.token = context.adminToken
          return noteListOpt(context, { filter: { id: ['2', '4', '5'] } })
        })
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array').that.have.lengthOf(3)
          expect(res.body[0].id).to.be.equal('2')
          expect(res.body[1].id).to.be.equal('4')
          expect(res.body[2].id).to.be.equal('5')
        })
        .catch((e) => { throw e })
    })
    it('1-3: several fields, single-value', function () {
      return signupUser(context, UserAdmin)
        .then(() => loginAs(context, UserAdmin))
        .then((res) => {
          context.adminToken = res.body.token
          context.token = context.adminToken
          return noteListOpt(context, { filter: { id: '2', caption: 'Note 2 caption' } })
        })
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array').that.have.lengthOf(1)
          expect(res.body[0].id).to.be.equal('2')
        })
        .catch((e) => { throw e })
    })
    it('1-4: several fields, several values', function () {
      return signupUser(context, UserAdmin)
        .then(() => loginAs(context, UserAdmin))
        .then((res) => {
          context.adminToken = res.body.token
          context.token = context.adminToken
          return noteListOpt(context, { filter: { id: ['2', '3'], caption: ['Note 2 caption', 'Note 3 caption'] } })
        })
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array').that.have.lengthOf(2)
          expect(res.body[0].id).to.be.equal('2')
          expect(res.body[1].id).to.be.equal('3')
        })
        .catch((e) => { throw e })
    })
    it('1-5: special q filter', function () {
      return signupUser(context, UserAdmin)
        .then(() => loginAs(context, UserAdmin))
        .then((res) => {
          context.adminToken = res.body.token
          context.token = context.adminToken
          return noteListOpt(context, { filter: { q: '2 caption' } })
        })
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array').that.have.lengthOf(1)
          expect(res.body[0].id).to.be.equal('2')
        })
        .catch((e) => { throw e })
    })
    describe('1-6: numeric field', function () {
      it('1-6-1: numeric field, gt', function () {
        return signupUser(context, UserAdmin)
          .then(() => loginAs(context, UserAdmin))
          .then((res) => {
            context.adminToken = res.body.token
            context.token = context.adminToken
            return noteListOpt(context, { filter: { comments_gt: 11 } })
          })
          .then((res) => {
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('array').that.have.lengthOf(1)
            expect(res.body[0].id).to.be.equal('8')
          })
          .catch((e) => { throw e })
      })
      it('1-6-2: numeric field, gte', function () {
        return signupUser(context, UserAdmin)
          .then(() => loginAs(context, UserAdmin))
          .then((res) => {
            context.adminToken = res.body.token
            context.token = context.adminToken
            return noteListOpt(context, { filter: { comments_gte: 11 } })
          })
          .then((res) => {
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('array').that.have.lengthOf(2)
            expect(res.body[0].id).to.be.equal('4')
            expect(res.body[1].id).to.be.equal('8')
          })
          .catch((e) => { throw e })
      })
      it('1-6-3: numeric field, lt', function () {
        return signupUser(context, UserAdmin)
          .then(() => loginAs(context, UserAdmin))
          .then((res) => {
            context.adminToken = res.body.token
            context.token = context.adminToken
            return noteListOpt(context, { filter: { comments_lt: 2 } })
          })
          .then((res) => {
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('array').that.have.lengthOf(3)
            expect(res.body[0].id).to.be.equal('3')
            expect(res.body[1].id).to.be.equal('10')
            expect(res.body[2].id).to.be.equal('11')
          })
          .catch((e) => { throw e })
      })
      it('1-6-4: numeric field, lte', function () {
        return signupUser(context, UserAdmin)
          .then(() => loginAs(context, UserAdmin))
          .then((res) => {
            context.adminToken = res.body.token
            context.token = context.adminToken
            return noteListOpt(context, { filter: { comments_lte: 2 } })
          })
          .then((res) => {
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('array').that.have.lengthOf(5)
            expect(res.body[0].id).to.be.equal('2')
            expect(res.body[1].id).to.be.equal('3')
            expect(res.body[2].id).to.be.equal('6')
            expect(res.body[3].id).to.be.equal('10')
            expect(res.body[4].id).to.be.equal('11')
          })
          .catch((e) => { throw e })
      })
    })
    describe('1-7: date field', function () {
      it('1-7-1: date field, single value, _lte', function () {
        return signupUser(context, UserAdmin)
          .then(() => loginAs(context, UserAdmin))
          .then((res) => {
            context.adminToken = res.body.token
            context.token = context.adminToken
            return noteListOpt(context, { filter: { createdAt_lte: '2020-03-02' } })
          })
          .then((res) => {
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('array').that.have.lengthOf(7)
            expect(res.body[0].id).to.be.equal('1')
            expect(res.body[1].id).to.be.equal('2')
            expect(res.body[2].id).to.be.equal('3')
            expect(res.body[3].id).to.be.equal('4')
            expect(res.body[4].id).to.be.equal('5')
            expect(res.body[5].id).to.be.equal('6')
            expect(res.body[6].id).to.be.equal('7')
          })
          .catch((e) => { throw e })
      })
      it('1-7-2: date field, range values, _gte + _lt', function () {
        return signupUser(context, UserAdmin)
          .then(() => loginAs(context, UserAdmin))
          .then((res) => {
            context.adminToken = res.body.token
            context.token = context.adminToken
            return noteListOpt(context, { filter: { createdAt_gte: '2020-02-01', createdAt_lt: '2020-03-02' } })
          })
          .then((res) => {
            expect(res.body).to.exist('Body should exist')
            expect(res.body).to.be.an('array').that.have.lengthOf(3)
            expect(res.body[0].id).to.be.equal('4')
            expect(res.body[1].id).to.be.equal('5')
            expect(res.body[2].id).to.be.equal('6')
          })
          .catch((e) => { throw e })
      })
    })
  })

  describe('2: flow mw:', function () {
    it('2-1: run flow from emulated http req', function () {
      // emulate http req:
      const ctx = {
        http: {
          req: {
            body: {
              email: UserAdmin.email,
              password: UserAdmin.password
            }
          },
          res: {
            body: {},
            status: null
          }
        }
      }
      return app.exModular.flow.run('Auth.Signup', ctx)
        .then((res) => {
          expect(ctx).to.be.not.null()
        })
    })
    it('2-2: add hooks for domainCheck', function () {
      const Flow = app.exModular.flow

      // extend flow with additional step:
      Flow.flows['Auth.Signup'] = Flow.flowAddStAfter(Flow.flows['Auth.Signup'], { action: Flow.actions.userFindByEmail },
        {
          action: Flow.actions.checkDomain,
          before: (ctx, stCtx) => {
            stCtx.email = ctx.http.req.body.email
          }
        })

      process.env.AUTH_SIGNUP_CHECK_DOMAIN = true

      return signupUser(context, UserAdmin,403)
        // .then(() => loginAs(context, UserAdmin))
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body.error).to.exist('Body should exist')
        })
    })

    it('2-3: domainCheck - add user to specified groups', function () {
      const Flow = app.exModular.flow
      console.log('add hook:')
      Flow.flows['Auth.Signup'] = Flow.flowAddStAfter(Flow.flows['Auth.Signup'], { action: Flow.actions.userFindByEmail },
        {
          action: Flow.actions.checkDomain,
          before: (ctx, stCtx) => {
            stCtx.email = ctx.http.req.body.email
          },
          after: (ctx, stCtx) => {
            ctx.data.domain = stCtx.domain
          }
        })

      Flow.flows['Auth.Signup'] = Flow.flowAddStAfter(Flow.flows['Auth.Signup'], { action: Flow.actions.userCreate },
        {
          action: Flow.actions.userGroupAddUserToGroups,
          before: (ctx, stCtx) => {
            stCtx.user = ctx.data.user
            stCtx.groups = ctx.data.domain.groups
          }
        })

      process.env.AUTH_SIGNUP_CHECK_DOMAIN = true
      console.log('prepare to run flow:')

      const aUser = _.assign({}, UserAdmin, { email: 'admin@biomatrix.pro' })

      return signupUser(context, aUser)
        .then((res) => {
          expect(res.body).to.exist('Body should exist')
          expect(res.body.id).to.exist('Body should exist')
          expect(res.body.email).to.be.equal(aUser.email)
        })
    })
  })
  describe('3. flow core:', function () {
    it('3-1: check for invalid flow input', function () {
      const Flow = app.exModular.flow
      const someFlowName = 'SomeFlow'
      Flow.flows[someFlowName] = [
        {
          action: 'userFindByEmail',
          before: (ctx, stCtx) => {
            // we need to init stCtx.user, but we pass
          }
        }
      ]
      expect(Flow.run(someFlowName, {})).to.be.rejectedWith(Error)
    })
  })
})
