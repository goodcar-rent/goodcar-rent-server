import _ from 'lodash'
import uuid from 'uuid/v4'

/* Invite:
  * id : uuid
  * expireAt : date
  * registeredUser : -> User.id
  * disabled : boolean
  * email: invited to this email
  * assignUserGroups: [] array of user group Ids to assign for user created via this invite
*/

export default module.exports = (app) => {
  const Model = {
    name: 'Invite',
    props: [
      {
        name: 'id',
        type: 'id',
        default: () => uuid()
      },
      {
        name: 'expireAt',
        type: 'datetime',
        default: () => {
          const defTTL = 3 * 1000 * 60 * 60 * 24 // TTL = 3 * 24h
          const aDate = (Date.now() + defTTL)
          console.log(`Date.now = ${Date.now()}, value = ${aDate}`)
          return aDate
        }
      },
      {
        name: 'registeredUser',
        type: 'ref',
        default: null
      },
      {
        name: 'createdBy',
        type: 'ref',
        default: null
      },
      {
        name: 'disabled',
        type: 'boolean',
        default: false
      },
      {
        name: 'email',
        type: 'text',
        default: null
      },
      {
        name: 'assignUserGroups',
        type: 'refs',
        default: []
      }
    ]
  }
  Model.app = app
  return _.merge(Model, {
    processDefaults: app.storage.processDefaults(Model),
    processGetProps: app.storage.processGetProps(Model),
    initData: app.storage.init(Model),
    clearData: app.storage.clearData(Model),
    findById: app.storage.findById(Model),
    findOne: app.storage.findOne(Model),
    findAll: app.storage.findAll(Model),
    count: app.storage.count(Model),
    removeById: app.storage.removeById(Model),
    removeAll: app.storage.removeAll(Model),
    create: app.storage.create(Model),
    update: app.storage.update(Model),
  })
}
