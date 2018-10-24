import { describe, it, before, beforeEach } from 'mocha'
import chai, { expect } from 'chai'
import dirtyChai from 'dirty-chai'
import App from '../../app'
import { systemTypeAdmin } from '../../services/user-group'

chai.use(dirtyChai)

// test case:
describe('user-group:', () => {
  process.env.NODE_ENV = 'test' // just to be sure
  const app = App()
  const { UserGroup } = app.models
  const users = [
    { id: 1, name: '1' },
    { id: 2, name: '2' }
  ]

  describe('add/remove method', () => {
    beforeEach(function (done) {
      app.models.ClearData()
        .then(() => done())
    })

    let userGroup = {}

    it('should add items', (done) => {
      UserGroup.create({ name: 'admin', systemType: systemTypeAdmin })
        .then((ug) => {
          userGroup = ug
          expect(userGroup).to.exist()
          expect(userGroup.id).to.exist()
          expect(userGroup.systemType).is.equal(systemTypeAdmin)
          return UserGroup.count()
        })
        .then((cnt) => {
          expect(cnt).is.equal(1)
          return UserGroup.addUser(userGroup.id, users[0])
        })
        .then((user1) => {
          expect(user1).to.exist()
          return UserGroup.addUser(userGroup.id, users[1])
        })
        .then((user2) => {
          expect(user2).to.exist()
          expect(userGroup.users.length).is.equal(2)
          done()
        })
        .catch((err) => done(err))
    })
    it('should remove items', (done) => {
      UserGroup.create({ name: 'admin', systemType: systemTypeAdmin })
        .then((ug) => {
          userGroup = ug
          expect(userGroup).to.exist()
          return UserGroup.count()
        })
        .then((cnt) => {
          expect(cnt).is.equal(1)
          return UserGroup.addUser(userGroup.id, users[0])
        })
        .then((user1) => {
          expect(user1).to.exist()
          return UserGroup.addUser(userGroup.id, users[1])
        })
        .then((user2) => {
          expect(user2).to.exist()
          expect(userGroup.users.length).is.equal(2)
          return UserGroup.removeUser(users[0].id)
        })
        .then(() => {
          expect(userGroup.users.length).is.equal(1)
          return UserGroup.removeUser(users[1].id)
        })
        .then(() => {
          expect(userGroup.users.length).is.equal(0)
          done()
        })
        .catch((err) => done(err))
    })
  })
  describe('create_x_Data methods', () => {
    before((done) => {
      app.models.ClearData()
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
          expect(UserGroup.systemGroupAdmin()).is.not.null()
          expect(UserGroup.systemGroupGuest()).is.not.null()
          expect(UserGroup.systemGroupLoggedIn()).is.not.null()
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
          expect(UserGroup.systemGroupAdmin()).is.not.null()
          expect(UserGroup.systemGroupGuest()).is.not.null()
          expect(UserGroup.systemGroupLoggedIn()).is.not.null()
          done()
        })
        .catch((err) => done(err))
    })
  })
})
