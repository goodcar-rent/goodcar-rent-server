import { v4 as uuid } from 'uuid'

export const YCDepartment = () => {
  return {
    name: 'YCDepartment',
    caption: 'YC.Отдел',
    description: 'Отдел в Yandex Connect',
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Идентификатор',
        description: 'Идентификатор отдела',
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
        caption: 'Название отдела',
        description: 'Текстовое название отдела, например, «Отдел разработки»',
        default: null
      },
      {
        name: 'externalId',
        type: 'text',
        format: '',
        caption: 'Идентификатор внешний',
        description: 'Произвольный идентификатор, который вы можете задать при создании отдела',
        default: null
      },
      {
        name: 'removed',
        type: 'boolean',
        format: '',
        caption: 'Удалён',
        description: 'Признак удаленного отдела',
        default: null
      },
      {
        name: 'parents',
        type: 'refs',
        model: 'YCDepartment',
        format: '',
        caption: 'Вышестоящие отделы',
        description: 'Массив объектов с информацией о родительских отделах. Содержит информацию обо всех вышестоящих отделах',
        default: null
      },
      {
        name: 'label',
        type: 'text',
        format: '',
        caption: 'Рассылка',
        description: 'Имя почтового ящика отдела',
        default: null
      },
      {
        name: 'created',
        type: 'datetime',
        format: '',
        caption: 'Создан',
        description: 'Дата и время создания отдела',
        default: null
      },
      {
        name: 'parentId',
        type: 'ref',
        model: 'YCDepartment',
        format: '',
        caption: 'Головной отдел',
        description: 'Объект с информацией о непосредственном родителе отдела',
        default: null
      },
      {
        name: 'description',
        type: 'text',
        format: '',
        caption: 'Описание',
        description: 'Описание отдела',
        default: null
      },
      {
        name: 'membersCount',
        type: 'decimal',
        precision: 10,
        scale: 0,
        format: '',
        caption: 'Сотрудников',
        description: 'Количество сотрудников в отделе',
        default: null
      },
      {
        name: 'headId',
        type: 'ref',
        model: 'YCUser',
        format: '',
        caption: 'Руководитель',
        description: 'Идентификатор сотрудника-руководителя отдела',
        default: null
      },
      {
        name: 'users',
        type: 'refs',
        model: 'YCUser',
        format: '',
        size: 2048,
        caption: 'Сотрудники',
        description: 'Список сотрудников отдела',
        default: []
      }
    ]
  }
}
