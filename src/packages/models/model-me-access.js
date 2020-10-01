import { v4 as uuid } from 'uuid'
import * as ACCESS from '../const-access'

export const MeAccess = (app, options) => {
  if (!options) {
    options = {}
  }
  // options.storage = options.storage || 'default'

  const Model = {
    name: 'MeAccess',
    caption: 'Полномочия',
    description: 'Полномочия пользователя',
    routes: [],
    resourcePath: '/me/access',
    props: [
      {
        name: 'id',
        type: 'id',
        calculated: true,
        caption: 'Id',
        description: 'Идентификатор полномочия',
        default: () => uuid()
      },
      {
        name: 'permission',
        type: 'enum',
        calculated: true,
        caption: 'Разрешение',
        description: 'Какое резрешение указано для полномочия',
        format: [
          ACCESS.AccessPermissionType.unknown,
          ACCESS.AccessPermissionType.DENY,
          ACCESS.AccessPermissionType.ALLOW
        ],
        default: ACCESS.AccessPermissionType.unknown.value
      },
      {
        name: 'withGrant',
        type: 'boolean',
        calculated: true,
        caption: 'Передоверие',
        description: 'Есть ли право передоверия',
        default: false
      },
      {
        name: 'isAdmin',
        type: 'boolean',
        calculated: true,
        caption: 'isAdmin',
        description: 'Полномочие получено от статуса администратора',
        default: false
      },
      {
        name: 'error',
        type: 'text',
        calculated: true,
        caption: 'error',
        description: 'Ошибка',
        default: false
      },
      {
        name: 'permissionUserId',
        type: 'ref',
        calculated: true,
        model: 'PermissionUser',
        caption: 'РазрешениеПользователю',
        description: 'Ссылка на разрешение пользователя, которое предоставило эти полномочия',
        default: null
      },
      {
        name: 'permissionUserGroupId',
        type: 'ref',
        calculated: true,
        model: 'PermissionUserGroup',
        caption: 'Разрешение',
        description: 'Ссылка на разрешение группы, которое сформировало это полномочие',
        default: null
      }
    ]
  }

  // disable auto-generation of routes except list:
  Model.routes.create = null
  Model.routes.item = null
  Model.routes.save = null
  Model.routes.remove = null
  Model.routes.removeAll = null

  Model.handlerList = (req, res, next) => {
    const AccessObject = app.exModular.models.AccessObject
    const check = app.exModular.access.checkPermission

    let accessObject = null
    return AccessObject.findAll()
      .then((_accessObject) => {
        accessObject = _accessObject
        return Promise.all(accessObject.map((object) => check(req.user, object.id)))
      })
      .then((_permissions) => {
        const ret = []
        _permissions.map((perm, index) => {
          const r = {}
          r.id = accessObject[index].id
          r.permission = perm.permission
          r.isAdmin = perm.source.isAdmin ? perm.source.isAdmin : false
          r.error = perm.source.error ? perm.source.error : ''
          r.permissionUserId = perm.source.permissionUserId ? perm.source.permissionUserId : null
          r.permissionUserGroupId = perm.source.permissionUserGroupId ? perm.source.permissionUserGroupId : null

          if (r.permission === ACCESS.ALLOW) {
            ret.push(r)
          }
        })
        res.data = ret
        return ret
      })
      .catch((e) => { throw e })
  }

  Model.routes.list = {
    method: 'GET',
    name: `${Model.name}.list`,
    description: `Create new "${Model.name}"`,
    path: Model.resourcePath,
    before: [
      app.exModular.auth.check
      // app.exModular.access.check(`${Model.name}.create`),
      // app.exModular.services.validator.checkBodyForArrayOfModel(Model, { optionalId: true }),
      // Wrap(Model.beforeCheckPermission)
    ],
    handler: Model.handlerList,
    after: [
      app.exModular.services.controllerDF.sendData
    ]
  }

  return Model
}
