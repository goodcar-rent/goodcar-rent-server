import { v4 as uuid } from 'uuid'
// import _ from 'lodash'

export const AccessObjectType = {
  unknown: { value: null, caption: '(unknown)' },
  Controller: { value: 1, caption: 'Controller' }
}

export const AccessObject = (app, options) => {
  if (!options) {
    options = {}
  }
  // options.storage = options.storage || 'default'

  const Model = {
    name: 'AccessObject',
    caption: 'Объект доступа',
    description: 'Объект для контроля доступа в системе',
    resourcePath: '/access/object',
    props: [
      {
        name: 'id',
        type: 'id',
        description: 'Идентификатор',
        caption: 'Id',
        default: () => uuid()
      },
      {
        name: 'objectName',
        type: 'text',
        caption: 'Объект',
        description: 'Объект, для которого указывается доступ в системе',
        default: null
      },
      {
        name: 'type',
        type: 'enum',
        caption: 'Тип объекта',
        description: 'Тип объекта, для которого указан доступ',
        format: [
          AccessObjectType.unknown,
          AccessObjectType.Controller
        ],
        default: AccessObjectType.unknown.value
      }
    ]
  }
  return Model
}
