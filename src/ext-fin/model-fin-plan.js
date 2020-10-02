import { v4 as uuid } from 'uuid'

export const FinPlan = () => {
  return {
    name: 'FinPlan',
    caption: 'Тип операции',
    description: 'Тип операции Бюджета движения денежных средств - факт или план',
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
