/* eslint-env mocha */
import { describe, it, beforeEach } from 'mocha'
import supertest from 'supertest'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
//import { kindAllow } from '../../services/acl'
import App from '../../app'
import {
  createAdminUser,
  inviteCreate,
  loginAs,
  UserAdmin,
  UserFirst,
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
        console.log(1)
        expect(res.body).to.exist()
        expect(res.body.email).to.exist()
        expect(res.body.id).to.exist()
        UserAdmin.id = res.body.id
        return loginAs(context, UserAdmin)
      })
      .then((res) => {
        console.log(2)
        expect(res.body).to.exist()
        expect(res.body.token).to.exist()
        context.adminToken = context.token
        return inviteCreate(context, {email: UserFirst.email})
      })
      .then((res) => {
        console.log(3)
        expect(res.body).to.exist()
        expect(res.body.id).to.exist()
        context.userInvite = res.body.id
        UserFirst.invite = context.userInvite
        return createUser(context, UserFirst)
      })
      .then((res) => {
        console.log(4)
        expect(res.body).to.exist()
        expect(res.body.email).to.exist()
        expect(res.body.id).to.exist()
        UserFirst.id = res.body.id
        return loginAs(context, UserFirst)
      })
      .then((res) => {
        console.log(5)
        expect(res.body).to.exist()
        expect(res.body.token).to.exist()
        context.userToken = context.token
      })
      .then(() => done())
      .catch((err) => {
        console.log(err)
        done(err)
      })
  })

  describe('list method:', function () {
    it('should list active ACLs:', function (done) {
      context.token = context.adminToken

      const aData = {
        userId: UserFirst.id,
        object: 'Invite',
        permission: 'read',
        'kind': app.auth.kindAllow
      };

      console.log(aData)
      aclCreate(context, aData)
        .then((res) => {
          console.log('1')
          return aclList(context)
        })
        .then((res) => {
          console.log(2)
          expect(res.body).to.exist('Body should exist')
          expect(res.body).to.be.an('array')
          expect(res.body).to.have.lengthOf(2)
        })
        .then(() => done())
        .catch((err) => {
          console.log(err)
          done(err)
        })
    })
  })
})
