import { v4 as uuid } from 'uuid'
import { AccessPermissionType } from './const-access'
// import _ from 'lodash'

export const PermissionUserGroup = (app, options) => {
  if (!options) {
    options = {}
  }
  // options.storage = options.storage || 'default'

  const Model = {
    name: 'PermissionUserGroup',
    priority: 0,
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Id',
        description: 'Идентификатор разрешений для группы пользователей',
        default: () => uuid()
      },
      {
        name: 'userGroupId',
        type: 'ref',
        caption: 'Группа',
        description: 'Группа пользователей, к которой относится данное разрешение',
        model: 'UserGroup',
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
    ],
    resourcePath: '/access/permission-user-group'
  }
  return Model
}
