import { v4 as uuid } from 'uuid'
// import _ from 'lodash'

export const IntgConnection = (app) => {
  const Model = {
    name: 'IntgConnection',
    caption: 'Интеграция',
    description: 'Справочник интеграций с внешними сервисами',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: '',
        description: '',
        default: () => uuid()
      },
      {
        name: 'type',
        type: 'text',
        format: '',
        size: 32,
        caption: 'Тип',
        description: 'Тип интеграции: yandex_connect',
        default: ''
      },
      {
        name: 'userId',
        type: 'ref',
        model: 'User',
        caption: 'Пользователь',
        description: 'Пользователь, социальный аккаунт которого используется для импорта каталога',
        default: null
      },
      // {
      //   name: '',
      //   type: '',
      //   format: '',
      //   caption: '',
      //   description: '',
      //   default: ''
      // },
      {
        name: 'accessToken',
        type: 'text',
        caption: '',
        description: '',
        default: null
      },
      {
        name: 'resources',
        type: 'array',
        itemType: 'id',
        format: '',
        caption: 'Ресурсы',
        description: 'Ресурсы для импорта из внешней системы',
        default: ''
      },
      {
        name: 'lastImportId',
        type: 'ref',
        format: 'IntgImport',
        caption: 'Последний импорт',
        description: 'Последний импорт, который был обработан системой',
        default: null
      }
    ]
  }

  Model._create = app.exModular.storages.default.create(Model)

  Model.create = (aItem) => {
    const Yandex = app.exModular.services.yandex

    let integration = null

    return Model._create(aItem)
      .then((_integration) => {
        integration = _integration

        if (integration.type === 'yandex_connect') {
          return Yandex.ycImport(integration)
        }
        return Promise.resolve()
      })
      .then(() => { return integration })
      .catch(e => { throw e })
  }

  return Model
}
