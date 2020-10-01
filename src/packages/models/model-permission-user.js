import { v4 as uuid } from 'uuid'
import { AccessPermissionType } from '../const-access'
// import _ from 'lodash'

export const PermissionUser = (app, options) => {
  if (!options) {
    options = {}
  }
  // options.storage = options.storage || 'default'

  const Model = {
    name: 'PermissionUser',
    caption: 'Разрешения пользователя',
    description: 'Разрешения, установленные для определенных пользователей',
    resourcePath: '/access/permission-user',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Id',
        description: 'Идентификатор разрешений для пользователя',
        default: () => uuid()
      },
      {
        name: 'userId',
        type: 'ref',
        caption: 'Пользователь',
        description: 'Пользователь, к которому относится данное разрешение',
        model: 'User',
        default: null
      },
      {
        name: 'accessObjectId',
        type: 'ref',
        caption: 'Объект',
        description: 'Объект, на которое данное разрешение выдано',
        model: 'AccessObject',
        default: null
      },
      {
        name: 'permission',
        type: 'enum',
        caption: 'Разрешение',
        description: 'Какое именно разрешение выдано',
        format: [
          AccessPermissionType.unknown,
          AccessPermissionType.DENY,
          AccessPermissionType.ALLOW
        ],
        default: AccessPermissionType.unknown.value
      },
      {
        name: 'withGrant',
        type: 'boolean',
        caption: 'Передоверие',
        description: 'Есть ли право передоверить это разрешение',
        default: false
      }
    ]
  }
  return Model
}
