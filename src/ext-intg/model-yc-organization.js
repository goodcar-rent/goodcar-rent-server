import { v4 as uuid } from 'uuid'

export const YCOrganization = () => {
  return {
    name: 'YCOrganization',
    caption: 'YC.Организация',
    description: 'Организация в Yandex Connect',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Идентификатор',
        description: 'Идентификатор организации',
        default: () => uuid()
      },
      {
        name: 'directoryId',
        type: 'ref',
        model: 'DirectoryYandex',
        caption: 'Интеграция',
        description: 'Ссылка на профиль интеграции, через который загружены эти данные',
        default: null
      },
      {
        name: 'name',
        type: 'text',
        format: '',
        caption: 'Название',
        description: 'Название организации',
        default: null
      },
      {
        name: 'revision',
        type: 'text',
        format: '',
        caption: 'Ревизия',
        description: 'Номер ревизии организации. Каждое действие с организацией (добавление сотрудника, создание команды, изменение настроек) увеличивает номер ревизии на единицу',
        default: null
      },
      {
        name: 'label',
        type: 'text',
        format: '',
        caption: 'Обозначение',
        description: 'Обозначение организации. Допускается использовать только символы латинского алфавита, цифры, знаки подчеркивания и дефиса',
        default: null
      },
      {
        name: 'domainDisplay',
        type: 'text',
        format: '',
        caption: 'Основной домен',
        description: 'Имя основного домена',
        default: null
      },
      {
        name: 'domainMaster',
        type: 'text',
        format: '',
        caption: 'Технический домен',
        description: 'Имя технического домена',
        default: null
      },
      {
        name: 'allDomains',
        type: 'text',
        format: '',
        caption: 'Домены',
        description: 'Массив со списком доменов организации',
        default: null
      },
      {
        name: 'adminUserId',
        type: 'ref',
        model: 'YCUser',
        format: '',
        caption: 'Администратор',
        description: 'Идентификатор администратора организации',
        default: null
      },
      {
        name: 'email',
        type: 'text',
        format: '',
        caption: 'Email',
        description: 'Основная электронная почта организации',
        default: null
      },
      {
        name: 'diskLimit',
        type: 'text',
        format: '',
        caption: 'Емкость диска',
        description: 'Предел доступного пространства на Яндекс.Диске',
        default: null
      },
      {
        name: 'diskUsage',
        type: 'text',
        format: '',
        caption: 'Использование диска',
        description: 'Объем используемого пространства на Яндекс.Диске',
        default: null
      },
      {
        name: 'subscriptionPlan',
        type: 'text',
        format: '',
        caption: 'Подписка',
        description: 'Тип подписки на Яндекс.Коннект: free/paid',
        default: null
      },
      {
        name: 'country',
        type: 'text',
        format: '',
        caption: 'Страна',
        description: 'Обозначение страны организации по ISO 3166-1',
        default: null
      },
      {
        name: 'language',
        type: 'text',
        format: '',
        caption: 'Язык',
        description: 'Язык интерфейса для сотрудников организации',
        default: null
      },
      {
        name: 'fax',
        type: 'text',
        format: '',
        caption: 'Факс',
        description: 'Номер факса',
        default: null
      },
      {
        name: 'phoneNumber',
        type: 'text',
        format: '',
        caption: 'Телефон',
        description: 'Номер телефона',
        default: null
      }
    ]
  }
}
