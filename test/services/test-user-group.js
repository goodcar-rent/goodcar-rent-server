import { describe, it, beforeEach } from 'mocha'
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
  console.log(systemTypeAdmin)

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
          console.log(ug)
          console.log(systemTypeAdmin)
          expect(userGroup).to.exist()
          expect(userGroup.id).to.exist()
          expect(userGroup.systemType).is.equal(systemTypeAdmin)
          return UserGroup.count()
        })
        .then((cnt) => {
          expect(cnt).is.equal(1)
          return UserGroup.addUser(userGroup, users[0])
        })
        .then((user1) => {
          expect(user1).to.exist()
          return UserGroup.addUser(userGroup, users[1])
        })
        .then((user2) => {
          expect(user2).to.exist()
          expect(UserGroup.users.length).is.equal(2)
          done()
        })
        .catch((err) => done(err))
    })
  })
})
