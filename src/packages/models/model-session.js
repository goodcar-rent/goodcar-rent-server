import { v4 as uuid } from 'uuid'
// import _ from 'lodash'
import { SessionType } from '../const-session'

export const Session = (app) => {
  const Model = {
    name: 'Session',
    caption: 'Сессия',
    description: 'Сессия пользователя',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: '',
        description: '',
        default: () => uuid()
      },
      {
        name: 'userId',
        type: 'ref',
        model: 'User',
        caption: '',
        description: '',
        default: null
      },
      {
        name: 'createdAt',
        type: 'datetime',
        caption: '',
        description: '',
        default: () => Date.now()
      },
      {
        name: 'ip',
        type: 'text',
        caption: '',
        description: '',
        default: null
      },
      {
        name: 'type',
        type: 'enum',
        caption: '',
        description: '',
        format: [
          SessionType.Unknown,
          SessionType.Password,
          SessionType.Social
        ],
        default: SessionType.Password.value
      }
    ]
  }

  Model.createOrUpdate = (item) => {
    return Model.findOne({ where: { userId: item.userId, ip: item.ip } })
      .then((res) => {
        if (!res) {
          return Model.create(item)
        } else {
          // _.assign(item, res)
          res.createdAt = new Date()
          return Model.update(res.id, res)
        }
      })
      .catch(e => { throw e })
  }

  Model._removeById = app.exModular.storages.default.removeById(Model)

  Model.removeById = (id) => {
    const SessionSocial = app.exModular.models.SessionSocial
    const Serial = app.exModular.services.serial

    return Model._removeById(id)
      .then(() => SessionSocial.findAll({ where: { sessionId: id } }))
      .then((sessions) => {
        if (sessions) {
          return Serial(sessions.map((session) => () => SessionSocial.removeById(session.id)))
        }
      })
      .catch(e => { throw e })
  }
  return Model
}
