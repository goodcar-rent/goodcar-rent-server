import { v4 as uuid } from 'uuid'

export const IntgImport = (app) => {
  return {
    name: 'IntgImport',
    caption: 'Импорт из интеграции',
    description: 'Журнал импорта данных из интеграции',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: '',
        description: '',
        default: () => uuid()
      },
      {
        name: 'intgConnectionId',
        type: 'ref',
        model: 'IntgConnection',
        caption: 'Интеграция',
        description: 'Ссылка на интеграцию',
        default: null
      },
      {
        name: 'startedAt',
        type: 'datetime',
        format: 'YYYY/MM/DD',
        caption: 'Начало',
        description: 'Дата и время начала импорта',
        default: () => Date.now()
      },
      {
        name: 'finishedAt',
        type: 'datetime',
        format: 'YYYY/MM/DD',
        caption: 'Завершение',
        description: 'Дата и время завершения импорта',
        default: null
      },
      {
        name: 'prevImportId',
        type: 'ref',
        model: 'IntgImport',
        format: '',
        caption: 'Пред импорт',
        description: 'Предыдущий импорт',
        default: null
      },
      {
        name: 'status',
        type: 'text',
        format: 'text',
        caption: '',
        description: '',
        size: 64,
        default: ''
      },
      {
        name: 'statusMessage',
        type: 'text',
        format: 'text',
        caption: '',
        description: '',
        default: ''
      }
      // {
      //   name: 'rawUsers',
      //   type: 'text',
      //   format: 'json',
      //   size: 64000,
      //   caption: 'Пользователи - дамп',
      //   description: 'Дамп данных о пользователях из каталога',
      //   default: null
      // },
    ]
  }
}
