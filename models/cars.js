import uuid from 'uuid/v4'
import bcrypt from 'bcrypt'
import _ from 'lodash'

/* User:
  * id: user identifier, UUID
  * name:
  * email: email, that user choose for registering
  * password: hashed password
  * invitedBy: -> User.id: user that created invite
  * inviteDate: date of invite
  * inviteId -> Invite.id: link to invite
  * disabled: if user account is disabled
*/

export default module.exports = (app) => {
  const Model = {
    name: 'Car',
    props: [
      {
        name: 'id',
        type: 'id',
        default: () => uuid()
      },
      {
        name: 'caption',
        type: 'text',
        default: ''
      },
      {
        name: 'ribbon',
        type: 'text',
        default: ''
      },
      {
        name: 'icon',
        type: 'text',
        default: null
      },
      {
        name: 'engine',
        type: 'decimal',
        precision: 4,
        scale: 1,
        default: 0
      },
      {
        name: 'fuelType',
        type: 'enum',
        enum: [
          { value: 0, caption: 'Gas' },
          { value: 1, caption: 'Diesel' }
        ],
        default: 0
      },
      {
        name: 'transmission',
        type: 'enum',
        enum: [
          { value: 0, caption: 'MT' },
          { value: 1, caption: 'AT' }
        ],
        default: 0
      },
      {
        name: 'baggage',
        type: 'decimal',
        precision: 2,
        scale: 0,
        default: 0
      },
      {
        name: 'people',
        type: 'decimal',
        precision: 2,
        scale: 0,
        default: 0
      },
      {
        name: 'orderBy',
        type: 'text',
        default: ''
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

    isPassword: (encodedPassword, password) => bcrypt.compareSync(password, encodedPassword)
  })
}
