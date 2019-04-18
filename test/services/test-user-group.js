import { describe, it, beforeEach, before, after } from 'mocha'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import App from '../../app'
import env from 'dotenv-safe'
import supertest from 'supertest'

chai.use(dirtyChai)

// test case:
describe('[service] user-group:', () => {
  env.config()
  process.env.NODE_ENV = 'test' // just to be sure
  let app = null
  let UserGroup = null

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
        UserGroup = app.models.UserGroup
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

  const users = [
    { id: '1', name: '1' },
    { id: '2', name: '2' }
  ]

  describe('add/remove method', () => {
    beforeEach(function (done) {
      app.models.clearData()
        .then(() => done())
    })

    let userGroup = {}

    it('should add items', (done) => {
      UserGroup.create({ name: 'admin', systemType: app.consts.systemTypeAdmin })
        .then((ug) => {
          userGroup = ug
          expect(userGroup).to.exist('userGroup should exist')
          expect(userGroup.id).to.exist('userGroup.id should exist')
          expect(userGroup.systemType).is.equal(app.consts.systemTypeAdmin)
          return UserGroup.count()
        })
        .then((cnt) => {
          expect(cnt).is.equal(1)
          return UserGroup.addUser(userGroup.id, users[0])
        })
        .then((user1) => {
          expect(user1).to.exist('user1 should exist')
          return UserGroup.addUser(userGroup.id, users[1])
        })
        .then((user2) => {
          expect(user2).to.exist('user2 should exist')
          expect(user2.users.length).is.equal(2)
          done()
        })
        .catch((err) => done(err))
    })
    it('should remove items', (done) => {
      UserGroup.create({ name: 'admin', systemType: app.consts.systemTypeAdmin })
        .then((ug) => {
          userGroup = ug
          expect(userGroup).to.exist('userGroup should exist')
          return UserGroup.count()
        })
        .then((cnt) => {
          expect(cnt).is.equal(1)
          return UserGroup.addUser(userGroup.id, users[0].id)
        })
        .then((res) => {
          expect(res).to.exist('res should exist')
          expect(res.users).to.exist('res.users should exist')
          expect(res.users).to.have.lengthOf(1)
          return UserGroup.addUser(userGroup.id, users[1].id)
        })
        .then((res) => {
          expect(res).to.exist('res should exist')
          expect(res.users).to.exist('res.users should exist')
          expect(res.users).to.have.lengthOf(2)
          return UserGroup.removeUser(userGroup.id, users[0].id)
        })
        .then((res) => {
          expect(res).to.exist('res should exist')
          expect(res.users).to.exist('res.users should exist')
          expect(res.users).to.have.lengthOf(1)
          return UserGroup.removeUser(userGroup.id, users[1].id)
        })
        .then((res) => {
          expect(res).to.exist('res should exist')
          expect(res.users).to.exist('res.users should exist')
          expect(res.users).to.have.lengthOf(0)
          done()
        })
        .catch((err) => done(err))
    })
  })
  describe('create_x_Data methods', () => {
    before((done) => {
      app.models.clearData()
        .then(() => done())
    })
    it('should create system data', (done) => {
      UserGroup.createSystemData()
        .then(() => UserGroup.count())
        .then((cnt) => {
          expect(cnt).is.equal(3)
          return UserGroup.findAll()
        })
        .then((allGroups) => {
          expect(allGroups.length).is.equal(3)
          expect(UserGroup.systemGroupAdmin()).is.not.null('systemGroupAdmin  should exist')
          expect(UserGroup.systemGroupGuest()).is.not.null('systemGroupGuest should exist')
          expect(UserGroup.systemGroupLoggedIn()).is.not.null('systemGroupLoggedIn should exist')
          done()
        })
        .catch((err) => done(err))
    })
    it('should create other data', (done) => {
      UserGroup.createSystemData()
        .then(() => UserGroup.createData())
        .then(() => UserGroup.count())
        .then((cnt) => {
          expect(cnt).is.equal(5)
          return UserGroup.findAll()
        })
        .then((allGroups) => {
          expect(allGroups.length).is.equal(5)
          expect(UserGroup.systemGroupAdmin()).is.not.null('systemGroupAdmin  should exist')
          expect(UserGroup.systemGroupGuest()).is.not.null('systemGroupGuest should exist')
          expect(UserGroup.systemGroupLoggedIn()).is.not.null('systemGroupLoggedIn should exist')
          done()
        })
        .catch((err) => done(err))
    })
  })
})
