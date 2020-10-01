import { v4 as uuid } from 'uuid'
import _ from 'lodash'

export const UserGroup = (app) => {
  const Model = {
    name: 'UserGroup',
    caption: '',
    description: '',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: '',
        description: '',
        default: () => uuid()
      },
      {
        name: 'name',
        type: 'text',
        caption: '',
        description: '',
        default: null
      },
      {
        name: 'systemType',
        type: 'text',
        caption: '',
        description: '',
        default: ''
      },
      {
        name: 'users',
        type: 'refs',
        model: 'User',
        caption: '',
        description: '',
        default: []
      }
    ]
  }

  Model.usersAfterRemove = (req, res, next) => {
    if (!req.data || !Array.isArray(req.data) || req.data.length === 0) {
      return {}
    }

    const Session = app.exModular.models.Session
    const Serial = app.exModular.services.serial

    return Session.findAll({ whereIn: { column: 'userId', ids: req.data } })
      .then((_session) => {
        if (!_session) {
          return {}
        }
        return Serial(_session.map((item) => () =>
          Session.removeById(item.id)
            .catch((e) => { throw e })))
      })
  }

  const usersIndex = _.findIndex(Model.props, { name: 'users', type: 'refs' })
  const usersProp = Model.props[usersIndex]
  usersProp.afterRemove = app.exModular.services.wrap(Model.usersAfterRemove)
  return Model
}
