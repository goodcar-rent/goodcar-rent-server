import { v4 as uuid } from 'uuid'
// import _ from 'lodash'

export const UserDomain = () => {
  return {
    name: 'UserDomain',
    caption: 'Домены',
    description: 'Домены, которые зарегистрированы в приложении',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Идентификатор',
        description: 'Идентификатор домена',
        default: () => uuid()
      },
      {
        name: 'domain',
        type: 'text',
        caption: 'Домен',
        description: 'Доменное имя',
        default: null
      },
      {
        name: 'isAllow',
        type: 'text',
        caption: 'Разрешён',
        description: 'Признак того, разрешена ли регистрация пользователей из этого домена',
        default: false
      },
      {
        name: 'groups',
        type: 'refs',
        model: 'UserGroup',
        caption: 'Группы',
        description: 'В какие группы будет автоматически добавлен пользователь этого домена при регистрации',
        default: []
      }
    ]
  }
}
