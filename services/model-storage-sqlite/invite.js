import _ from 'lodash'
import uuid from 'uuid/v4'
import {
  genericClearData,
  genericCount, genericCreate, genericDelete, genericDeleteAll,
  genericFindAll,
  genericFindById,
  genericFindOne,
  genericInit, genericUpdate
} from './generic-sqlite'

/* Invite:
  * id : uuid
  * expireAt : date
  * registeredUser : -> User.id
  * disabled : boolean
  * email: invited to this email
  * assignUserGroups: [] array of user group Ids to assign for user created via this invite
*/
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
      default: () => Date.now()
    },
    {
      name: 'registeredUser',
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

export default module.exports = (app) => {
  Model.app = app
  const aModel = {
    initData: genericInit(Model),
    clearData: genericClearData(Model),
    findById: genericFindById(Model),
    findOne: genericFindOne(Model),
    findAll: genericFindAll(Model),
    count: genericCount(Model),
    delete: genericDelete(Model),
    deleteAll: genericDeleteAll(Model),
    create: genericCreate(Model),
    update: genericUpdate(Model)
  }
  return aModel
}
