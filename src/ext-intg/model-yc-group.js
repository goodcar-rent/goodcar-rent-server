import { v4 as uuid } from 'uuid'

export const YCGroup = () => {
  return {
    name: 'YCGroup',
    caption: 'YC.Команда',
    description: 'Организация в Yandex Connect',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Идентификатор',
        description: 'Идентификатор команды',
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
        description: 'Название команды',
        default: null
      },
      {
        name: 'email',
        type: 'text',
        format: '',
        caption: 'Email',
        description: 'Адрес почтовой рассылки команды',
        default: null
      },
      {
        name: 'externalId',
        type: 'text',
        format: '',
        caption: 'Внешний идентификатор',
        description: 'Произвольный идентификатор, который вы можете задать при создании команды',
        default: null
      },
      {
        name: 'label',
        type: 'text',
        format: '',
        caption: 'Расссылка',
        description: 'Имя почтового ящика команды',
        default: null
      },
      {
        name: 'created',
        type: 'datetime',
        format: '',
        caption: 'Создана',
        description: 'Дата и время создания команды',
        default: null
      },
      {
        name: 'type',
        type: 'text',
        format: '',
        caption: 'Тип',
        description: 'Тип команды',
        default: null
      },
      {
        name: 'authorId',
        type: 'ref',
        model: 'YUser',
        format: '',
        caption: 'Создан',
        description: 'Сотрудник - создатель команды',
        default: null
      },
      {
        name: 'memberUser',
        type: 'refs',
        model: 'YCUser',
        format: '',
        caption: 'Участники-пользователи',
        description: 'Участники команды - пользователи',
        default: null
      },
      {
        name: 'memberGroup',
        type: 'refs',
        model: 'YCGroup',
        format: '',
        caption: 'Участники - команды',
        description: '',
        default: null
      },
      {
        name: 'memberDepartment',
        type: 'refs',
        model: 'YCDepartment',
        format: '',
        caption: 'Участники - отделы',
        description: '',
        default: null
      }
    ]
  }
}
