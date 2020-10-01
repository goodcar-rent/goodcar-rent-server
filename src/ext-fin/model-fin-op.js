import { v4 as uuid } from 'uuid'
import { AccessObjectType } from '../packages/models/model-access-object'

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
        default: AccessObjectType.unknown.value
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
