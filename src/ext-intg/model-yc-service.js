import { v4 as uuid } from 'uuid'

export const YCService = () => {
  return {
    name: 'YCService',
    caption: 'YC.Сервис',
    description: 'Сервисы Yandex Connect подключенные к организации',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Идентификатор',
        description: 'Идентификатор сервиса',
        default: () => uuid()
      },
      {
        name: 'ycOrganizationId',
        type: 'ref',
        model: 'YCOrganization',
        caption: 'Организация',
        description: 'Организация, к которой подключены сервисы',
        default: null
      },
      {
        name: 'slug',
        type: 'text',
        format: '',
        caption: 'Название',
        description: 'Обозначение сервиса',
        default: null
      },
      {
        name: 'ready',
        type: 'boolean',
        format: '',
        caption: 'Подключен',
        description: 'Состояние сервиса: готов к работе',
        default: null
      }
    ]
  }
}
