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
      }
    ]
  }
  return Model
}
