import { v4 as uuid } from 'uuid'

export const YCUser = () => {
  return {
    name: 'YCUser',
    caption: 'YC.Пользователь',
    description: 'Профиль пользователя в Yandex Connect',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Идентификатор',
        description: 'Идентификатор сотрудника',
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
        name: 'isRobot',
        type: 'boolean',
        caption: 'Бот',
        description: 'Признак служебных сотрудников-ботов',
        default: null
      },
      {
        name: 'externalId',
        type: 'text',
        caption: 'Внешний идентификатор',
        description: '',
        default: null
      },
      {
        name: 'position',
        type: 'text',
        caption: 'Должность',
        description: 'Должность сотрудника',
        default: null
      },
      {
        name: 'departments',
        type: 'refs',
        model: 'YCDepartment',
        format: '',
        caption: 'Отделы',
        description: 'Массив объектов с информацией об отделах, к которым относится сотрудник (включая вышестоящие отделы)',
        default: null
      },
      {
        name: 'orgId',
        type: 'ref',
        model: 'YCOrganization',
        format: '',
        caption: 'Организация',
        description: 'Идентификатор организации, в которой состоит сотрудник',
        default: null
      },
      {
        name: 'gender',
        type: 'text',
        format: 'text',
        caption: 'Пол',
        description: 'gjk cjnhelybrf',
        default: null
      },
      {
        name: 'created',
        type: 'datetime',
        format: '',
        caption: 'Дата создания',
        description: 'Дата и вермя создания профиля сотрудника',
        default: null
      },
      {
        name: 'nameFirst',
        type: 'text',
        format: 'text',
        caption: 'Имя',
        description: 'Имя сотрудника',
        default: null
      },
      {
        name: 'nameLast',
        type: 'text',
        format: 'text',
        caption: 'Фамилия',
        description: 'Фамилия сотрудника',
        default: null
      },
      {
        name: 'nameMiddle',
        type: 'text',
        format: 'text',
        caption: 'Отчество',
        description: 'Отчество сотрудника',
        default: null
      },
      {
        name: 'about',
        type: 'text',
        format: '',
        caption: 'Описание',
        description: 'Описание сотрудника',
        default: null
      },
      {
        name: 'nickname',
        type: 'text',
        format: '',
        caption: 'Логин',
        description: 'Логин сотрудника',
        default: null
      },
      {
        name: 'groups',
        type: 'refs',
        model: 'YCGroup',
        format: '',
        caption: 'Команды',
        description: 'Массив объектов с информацией о командах, в которых состоит сотрудник',
        default: null
      },
      {
        name: 'isAdmin',
        type: 'boolean',
        format: '',
        caption: 'Администратор',
        description: 'Признак администратора организации',
        default: false
      },
      {
        name: 'birthday',
        type: 'text',
        format: '',
        caption: 'Дата рождения',
        description: 'Дата рождения сотрудника в формате YYYY-MM-DD',
        default: null
      },
      {
        name: 'departmentId',
        type: 'ref',
        model: 'YCDepartment',
        format: '',
        caption: 'Отдел',
        description: 'Идентификатор отдела, в котором состоит сотрудник',
        default: null
      },
      {
        name: 'email',
        type: 'text',
        format: 'email',
        caption: 'Email',
        description: 'Основной адрес электронной почты сотрудника',
        default: null
      },
      {
        name: 'isDismissed',
        type: 'boolean',
        format: '',
        caption: 'Уволен',
        description: 'Статус сотрудника: уволенный или действующий',
        default: null
      },
      {
        name: 'aliases',
        type: 'text',
        format: '',
        caption: 'Псевдонимы',
        description: 'Перечень псевдонимов сотрудника',
        default: null
      }
    ]
  }
}
