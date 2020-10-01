import { v4 as uuid } from 'uuid'
import bcrypt from 'bcrypt'

export const User = (app, options) => {
  if (!options) {
    options = {}
  }
  options.storage = options.storage || 'default'

  const Schema = {
    name: 'User',
    caption: 'Пользователи',
    description: 'Пользователи системы',
    props: [
      {
        name: 'id',
        type: 'id',
        format: 'uuid',
        caption: 'Идентификатор',
        description: 'Идентификатор пользователя',
        default: () => uuid()
      },
      {
        name: 'name',
        type: 'text',
        format: 'name',
        caption: 'Имя пользователя',
        description: 'Имя пользователя',
        default: ''
      },
      {
        name: 'email',
        type: 'text',
        format: 'email',
        caption: 'Email',
        description: 'Электронная почта пользователя',
        default: ''
      },
      {
        name: 'password',
        type: 'text',
        format: 'password',
        caption: 'Пароль',
        description: 'Пароль',
        default: null,
        beforeSave: (item) => bcrypt.hashSync(item.password, bcrypt.genSaltSync())
      },
      {
        name: 'invitedBy',
        type: 'ref',
        default: null
      },
      {
        name: 'inviteDate',
        type: 'datetime',
        format: 'date',
        default: null
      },
      {
        name: 'inviteId',
        type: 'ref',
        default: null
      },
      {
        name: 'disabled',
        type: 'boolean',
        caption: 'Заблокирован',
        description: 'Признак, заблокирована ли учётная запись пользователя',
        default: false
      }
    ],
    isPassword: (encodedPassword, password) => bcrypt.compareSync(password, encodedPassword)
  }
  return Schema
}
