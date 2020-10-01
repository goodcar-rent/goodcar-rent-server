import { v4 as uuid } from 'uuid'

export const YCDomain = () => {
  return {
    name: 'YCDomain',
    caption: 'YC.Домен',
    description: 'Домен в Yandex Connect',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Идентификатор',
        description: 'Идентификатор домена',
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
        name: 'mx',
        type: 'boolean',
        format: '',
        caption: 'MX запись',
        description: 'Указывает ли mx-запись на север yandex',
        default: false
      },
      {
        name: 'delegated',
        type: 'boolean',
        format: '',
        caption: 'Делегирован',
        description: 'Признак домена, делегированного на серверы Яндекса',
        default: false
      },
      {
        name: 'tech',
        type: 'boolean',
        format: '',
        caption: 'Технический',
        description: 'Признак технического домена (домен вида < ваш домен >.yaconnect.com)',
        default: null
      },
      {
        name: 'popEnabled',
        type: 'boolean',
        format: '',
        caption: 'Протокол POP',
        description: 'Включен ли доступ к почтовым ящикам домена по протоколу POP',
        default: false
      },
      {
        name: 'master',
        type: 'boolean',
        format: '',
        caption: 'Основной',
        description: 'Признак основного домена',
        default: false
      },
      {
        name: 'postmasterUid',
        type: 'text',
        format: '',
        caption: 'Ящик администратора',
        description: 'Идентификатор почтового ящика по умолчанию',
        default: null
      },
      {
        name: 'owned',
        type: 'boolean',
        format: '',
        caption: 'Подтверждён',
        description: 'Признак подтвержденного домена',
        default: null
      },
      {
        name: 'country',
        type: 'text',
        format: '',
        caption: 'Страна',
        description: 'Страна домена',
        default: null
      },
      {
        name: 'name',
        type: 'text',
        format: '',
        caption: 'Домен',
        description: 'Полное доменное имя',
        default: null
      },
      {
        name: 'imapEnabled',
        type: 'boolean',
        format: '',
        caption: 'Протокол IMAP',
        description: 'Включен ли доступ к почтовым ящикам домена по протоколу IMAP',
        default: null
      }
    ]
  }
}
