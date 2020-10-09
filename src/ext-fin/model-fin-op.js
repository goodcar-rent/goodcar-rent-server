import { v4 as uuid } from 'uuid'

export const FinOpType = {
  unknown: { value: null, caption: '(unknown)' },
  initial: { value: 0, caption: 'initial' },
  income: { value: 1, caption: 'income' },
  payment: { value: 2, caption: 'payment' }
}

export const FinOp = () => {
  return {
    name: 'FinOp',
    caption: 'Финансовая операция',
    description: '',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Идентификатор',
        description: 'Идентификатор операции',
        default: () => uuid()
      },
      {
        name: 'caption',
        type: 'text',
        format: 'text',
        caption: 'Описание',
        description: 'Описание операции',
        default: null
      },
      {
        name: 'date',
        type: 'datetime',
        caption: 'Дата',
        description: 'Дата операции',
        default: null
      },
      {
        name: 'type',
        type: 'enum',
        caption: 'Тип',
        description: 'Тип операции',
        format: [
          FinOpType.unknown,
          FinOpType.initial,
          FinOpType.income,
          FinOpType.payment
        ],
        default: FinOpType.unknown.value
      },
      {
        name: 'orgId',
        type: 'ref',
        model: 'FinOrg',
        caption: 'Компания',
        description: 'Наша компания',
        default: null
      },
      {
        name: 'customerId',
        type: 'ref',
        model: 'FinOrg',
        caption: 'Контрагент',
        description: 'Контрагент',
        default: null
      },
      {
        name: 'finAccId',
        type: 'ref',
        model: 'FinAcc',
        caption: 'Счёт',
        description: 'Счёт, на который отнесена финансовая операция',
        default: null
      },
      {
        name: 'planId',
        type: 'ref',
        model: 'FinPlan',
        caption: 'Тип',
        description: 'Тип операции: факт, план',
        default: null
      },
      {
        name: 'cfoId',
        type: 'ref',
        model: 'FinCfo',
        caption: 'ЦФО',
        description: 'ЦФО операции',
        default: null
      },
      {
        name: 'summ',
        type: 'decimal',
        caption: 'Сумма',
        description: 'Сумма операции',
        format: '',
        precision: 12,
        scale: 2,
        default: 0
      }
    ]
  }
}
