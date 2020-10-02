import { v4 as uuid } from 'uuid'

export const FinAcc = () => {
  return {
    name: 'FinAcc',
    caption: 'Счёт БДДС',
    description: 'Счёт в Бюджетете движения денежных средств',
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
        description: 'Название счёта',
        default: null
      },
      {
        name: 'description',
        type: 'text',
        format: 'text',
        caption: 'Примечания',
        description: 'Примечания ',
        default: null
      },
      {
        name: 'parentId',
        type: 'ref',
        model: 'FinAcc',
        caption: 'Счёт главный',
        description: 'Ссылка на счёт верхнего уровня',
        default: null
      }
    ]
  }
}
