import { v4 as uuid } from 'uuid'

export const Note = (app) => {
  const Model = {
    name: 'Note',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Id',
        description: 'Идентификатор',
        format: 'uuid',
        default: () => uuid()
      },
      {
        name: 'caption',
        type: 'text',
        caption: 'Заголовок',
        format: 'text',
        size: 127,
        default: ''
      },
      {
        name: 'description',
        type: 'text',
        caption: 'Примечание',
        format: 'text',
        size: 127,
        default: ''
      },
      {
        name: 'createdAt',
        type: 'datetime',
        caption: 'Дата',
        format: 'date',
        default: null
      },
      {
        name: 'comments',
        type: 'decimal',
        precision: 12,
        scale: 0,
        caption: 'Комментариев',
        format: '',
        default: 0
      }
    ]
  }
  return Model
}
