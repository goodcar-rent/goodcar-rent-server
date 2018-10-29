/* eslint-env mocha */
import { describe, it } from 'mocha'
import supertest from 'supertest'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import App from '../../app'
import {
  createAdminUser,
  loginAs,
  UserAdmin
} from '../client/client-api'

chai.use(dirtyChai)

// test case:
describe('>>STORY ACL:', () => {
  process.env.NODE_ENV = 'test' // just to be sure
  const app = App()
  const request = supertest(app)
  // const { User } = app.models

  const context = {
    request,
    apiRoot: '',
    authSchema: 'Bearer'
  }

  it('Create new admin user and add some permissions:', function (done) {
    createAdminUser(context)
      .then((res) => {
        expect(res.body).to.exist('Body should exist')
      })
      .then(() => loginAs(context, UserAdmin))
      .then(() => {
        done()
      })
      .catch((err) => {
        done(err)
      })
  })
})
