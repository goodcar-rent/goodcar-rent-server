import { v4 as uuid } from 'uuid'

export const YCUserContact = () => {
  return {
    name: 'YCUserContact',
    caption: 'YC.Контакт',
    description: 'Контакты пользователя в Yandex Connect',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Идентификатор',
        description: 'Идентификатор сотрудника',
        default: () => uuid()
      },
      {
        name: 'ycUserId',
        type: 'ref',
        model: 'YCUser',
        caption: 'Пользователь',
        description: 'Пользователь, к которому относится данная контактная информация',
        default: null
      },
      {
        name: 'value',
        type: 'text',
        caption: 'Значение',
        description: 'Адрес ресурса, по которому расположен контакт',
        default: null
      },
      {
        name: 'type',
        type: 'text',
        format: '',
        caption: 'Тип контакта',
        description: 'Тип контакта',
        default: null
      },
      {
        name: 'main',
        type: 'boolean',
        format: '',
        caption: 'Основной',
        description: 'Признак основного контакта',
        default: null
      },
      {
        name: 'alias',
        type: 'text',
        format: '',
        caption: 'Псевдоним',
        description: 'Контакт автоматически создан на основе псевдонима для лектронной почты',
        default: null
      },
      {
        name: 'synthetic',
        type: 'text',
        format: '',
        caption: 'Автоматический',
        description: 'Признак автоматически созданного контакта',
        default: null
      }
    ]
  }
}
