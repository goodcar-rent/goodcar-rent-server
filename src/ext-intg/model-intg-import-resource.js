import { v4 as uuid } from 'uuid'

export const IntgImportResource = () => {
  return {
    name: 'IntgImportResource',
    caption: 'Импорт ресурса',
    description: 'Журнал импорта данных ресурса из интеграции',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: '',
        description: '',
        default: () => uuid()
      },
      {
        name: 'intgImportId',
        type: 'ref',
        model: 'IntgImport',
        caption: 'Импорт',
        description: 'Ссылка на импорт, к которому относится этот импорт ресурса',
        default: null
      },
      {
        name: 'resource',
        type: 'text',
        format: '',
        caption: 'Ресурс',
        description: 'Импортируемый ресурс',
        default: null
      },
      {
        name: 'resourceId',
        type: 'text',
        format: '',
        caption: 'id ресурса',
        description: 'Идентификатор в таблице - источнике ',
        default: null
      },
      {
        name: 'hash',
        type: 'text',
        format: '',
        size: 32,
        caption: 'Хэш',
        description: 'Хэш записи в таблице-источнике',
        default: null
      },
      {
        name: 'type',
        type: 'text',
        size: 7,
        format: '',
        caption: 'Тип',
        description: 'Тип записи: new, upd, same, del',
        default: null
      },
      {
        name: 'nextResourceId',
        type: 'ref',
        model: 'IntgImportResource',
        format: '',
        caption: 'След',
        description: 'Следующая версия этого ресурса',
        default: null
      }
      // {
      //   name: '',
      //   type: '',
      //   format: '',
      //   caption: '',
      //   description: '',
      //   default: null
      // },
    ]
  }
}
