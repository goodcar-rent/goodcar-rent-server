import { v4 as uuid } from 'uuid'

export const FinCfo = () => {
  return {
    name: 'FinCfo',
    caption: 'ЦФО',
    description: 'ЦФО для Бюджета движения денежных средств',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Идентификатор',
        description: 'Идентификатор',
        default: () => uuid()
      },
      {
        name: 'caption',
        type: 'text',
        format: 'text',
        caption: 'Название',
        description: 'Название плана',
        default: null
      },
      {
        name: 'description',
        type: 'text',
        format: 'text',
        caption: 'Примечания',
        description: 'Примечания ',
        default: null
      }
    ]
  }
}
