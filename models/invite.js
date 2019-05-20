import _ from 'lodash'
import uuid from 'uuid/v4'
import moment from 'moment'

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
        default: () => (moment().add(3, 'd')).toDate() // default TTL = 3d from now()
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
    processBeforeSaveToStorage: app.storage.processBeforeSaveToStorage(Model),
    processAfterLoadFromStorage: app.storage.processAfterLoadFromStorage(Model),
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
