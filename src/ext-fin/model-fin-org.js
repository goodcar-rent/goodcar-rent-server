import { v4 as uuid } from 'uuid'

export const FinOrg = () => {
  return {
    name: 'FinOrg',
    caption: 'Компания',
    description: 'Юридическое лицо',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Идентификатор',
        description: 'Идентификатор компании',
        default: () => uuid()
      },
      {
        name: 'caption',
        type: 'text',
        format: 'text',
        caption: 'Название',
        description: 'Название компании внутри системы',
        default: null
      },
      {
        name: 'description',
        type: 'text',
        format: 'text',
        caption: 'Примечания',
        description: 'Примечания о компании в свободной форме',
        default: null
      },
      {
        name: 'fullName',
        type: 'text',
        format: 'text',
        caption: 'Полное название',
        description: 'Полное юридическое название компании',
        default: null
      },
      {
        name: 'ceoId',
        type: 'ref',
        model: 'FinPerson',
        caption: 'Руководитель',
        description: 'Руководитель компании',
        default: null
      },
      {
        name: 'ceoTitle',
        type: 'text',
        format: 'text',
        caption: 'Должность руководителя',
        description: 'Должность руководителя компании - генеральный директор, директор, председатель правления и тп',
        default: null
      },
      {
        name: 'ceoDocument',
        type: 'text',
        format: 'text',
        caption: 'Полномочия руководителя',
        description: 'Документ, описывающий полномочия руководителя - устав',
        default: null
      },
      {
        name: 'fullAddress',
        type: 'text',
        format: 'text',
        caption: 'Адрес',
        description: 'Юридический адрес компании',
        default: null
      },
      {
        name: 'codeINN',
        type: 'text',
        format: 'text',
        size: 32,
        caption: 'ИНН',
        description: 'ИНН компании',
        default: null
      },
      {
        name: 'codeKPP',
        type: 'text',
        format: 'text',
        size: 32,
        caption: 'КПП',
        description: 'КПП компании',
        default: null
      } /*,
      {
        name: 'bankAccId',
        type: 'ref',
        model: 'FinBankAcc',
        caption: 'Расчетный счёт',
        description: 'Расчётный счёт компании',
        default: null
      } */
    ]
  }
}
