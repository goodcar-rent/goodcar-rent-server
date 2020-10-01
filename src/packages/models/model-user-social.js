import { v4 as uuid } from 'uuid'

export const UserSocial = () => {
  return {
    name: 'UserSocial',
    caption: 'Профиль в соцсети',
    description: 'Профиль пользователя в социальной сети',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Идентификатор',
        description: 'Идентификатор профиля соцсети',
        default: () => uuid()
      },
      {
        name: 'userId',
        type: 'ref',
        model: 'User',
        caption: 'Пользователь',
        description: 'Ссылка на локальный профиль пользователя, с которым ассоциирован этот профиль из соцсети',
        default: null
      },
      {
        name: 'provider',
        type: 'text',
        caption: 'Соцсеть',
        description: 'Социальная сеть из которой получен профиль',
        default: null
      },
      {
        name: 'rawProfile',
        type: 'text',
        size: 2048,
        caption: 'Профиль',
        description: 'Профиль в том виде, в котором получен из социальной сети',
        default: false
      },
      {
        name: 'email',
        type: 'text',
        format: 'email',
        caption: 'Электронная почта',
        description: 'Электронная почта, зарегистрированная в соцсети"',
        default: null
      }
    ]
  }
}
