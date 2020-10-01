import { v4 as uuid } from 'uuid'

export const LinkYCUser = () => {
  return {
    name: 'LinkYCUser',
    caption: 'Импортированный пользователь',
    description: 'Импортированный пользователь из Yandex Connect',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Идентификатор',
        description: 'Идентификатор импорта',
        default: () => uuid()
      },
      {
        name: 'ycUserId',
        type: 'ref',
        model: 'YCUser',
        caption: 'Пользователь.YC',
        description: 'Ссылка на профиль пользователя из Yandex Connect',
        default: null
      },
      {
        name: 'userId',
        type: 'ref',
        model: 'User',
        caption: 'Пользователь',
        description: 'Ссылка на локальный профиль пользователя',
        default: null
      },
      {
        name: 'type',
        type: 'text',
        format: '',
        caption: 'Тип',
        description: 'Тип импорта: full - полный, или partial',
        default: 'full'
      }
      // {
      //   name: '',
      //   type: '',
      //   model: '',
      //   format: '',
      //   caption: '',
      //   description: '',
      //   default: null
      // },
    ]
  }
}
