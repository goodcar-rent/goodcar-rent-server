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
import env from 'dotenv-safe'

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

// test case:
describe('exModular core tests', function () {
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

  describe('1: filter tests', function () {
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
          console.log(res.body)
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
          console.log(res.body)
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
          console.log(res.body)
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
          console.log(res.body)
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
          console.log(res.body)
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array').that.have.lengthOf(1)
          expect(res.body[0].id).to.be.equal('2')
        })
        .catch((e) => { throw e })
    })
  })
})
