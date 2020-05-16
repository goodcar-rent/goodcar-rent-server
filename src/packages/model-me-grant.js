import { v4 as uuid } from 'uuid'
import * as ACCESS from './const-access'
import { removeAllRouteName, saveRouteName } from './route-builder'

export const MeGrant = (app, options) => {
  if (!options) {
    options = {}
  }
  // options.storage = options.storage || 'default'

  const Model = {
    name: 'MeGrant',
    priority: 0,
    props: [
      {
        name: 'id',
        type: 'id',
        caption: 'Id',
        description: 'Идентификатор выданных передоверий',
        default: () => uuid()
      },
      {
        name: 'userId',
        type: 'ref',
        caption: 'Пользователь',
        description: 'Пользователь, к которому относится данное передоверие',
        model: 'User',
        default: null
      },
      {
        name: 'accessObjectId',
        type: 'ref',
        caption: 'Объект',
        description: 'Объект, на которое данное передоверие выдано',
        model: 'AccessObject',
        default: null
      },
      {
        name: 'permission',
        type: 'enum',
        caption: 'Разрешение',
        description: 'Какое именно передоверие выдано',
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
        caption: 'Передоверие',
        description: 'Есть ли право передоверить это передоверие',
        default: false
      },
      {
        name: 'permissionUserId',
        type: 'ref',
        model: 'PermissionUser',
        caption: 'Разрешение',
        description: 'Ссылка на разрешение, которое в рамках передоверия сформировано в системе',
        default: null
      }
    ],
    routes: [],
    resourcePath: '/me/grant'
  }

  const Wrap = app.exModular.services.wrap

  Model.beforeCheckPermission = (req, res, next) => {
    if (!Array.isArray(req.data._items)) {
      const err = new app.exModular.services.errors.ServerNotAllowed('beforeCheckPermission: permission should be in array in req.data')
      res.err = err
      return next(err)
    }

    const errors = []
    return app.exModular.services.serial(req.data._items.map((item) => () => {
      return app.exModular.access.checkPermission(req.user, item.accessObjectId)
        .then((permission) => {
          if (!(permission.permission === ACCESS.ALLOW && permission.withGrant === true)) {
            const err = new app.exModular.services.errors.ServerNotAllowed('No withGrant permission')
            errors.push(err)
          }
          if (item.permission !== ACCESS.ALLOW) {
            const err = new app.exModular.services.errors.ServerNotAllowed('permission should be ALLOW')
            errors.push(err)
          }
          return permission
        })
        .catch((e) => { throw e })
    }))
      .then(() => {
        if (errors.length > 0) {
          res.err = errors
          throw new app.exModular.services.errors.ServerNotAllowed('No withGrant permission')
        }
      })
  }

  /**
   * (async! need WRAP) после создания записи в базе, создать соответствующее разрешение
   * @param req
   * @param res
   * @param next
   * @return {Promise<void>|*}
   */
  Model.afterCreate = (req, res, next) => {
    // console.log('MeGrant.afterCreate')
    if (!res.data) {
      return Promise.resolve({})
    }

    const PermissionUser = app.exModular.models.PermissionUser
    return PermissionUser.create({
      userId: res.data.userId,
      accessObjectId: res.data.accessObjectId,
      permission: res.data.permission,
      withGrant: res.data.withGrant
    })
      .then((permissionUser) => {
        res.data.permissionUser = permissionUser
        return res.data
      })
      .catch((e) => { throw e })
  }

  Model.afterRemove = (req, res, next) => {
    const PermissionUser = app.exModular.models.PermissionUser

    const resData = res.data
    return PermissionUser.remove(res.data.permissionUserId)
      .then((permissionUser) => {
        resData.permissionUser = permissionUser
        res.data = resData
        return resData
      })
      .catch((e) => { throw e })
  }

  Model.afterRemoveAll = (req, res, next) => {
    const PermissionUser = app.exModular.models.PermissionUser

    const resData = res.data
    if (!Array.isArray(res.data)) {
      throw Error('afterRemoveAll: res.data should have an array of removed records')
    }
    const ids = []
    res.data.map((item) => { ids.push(item.permissionUserId) })
    return PermissionUser.removeAll({ whereIn: { column: PermissionUser.key, ids } })
      .then((permissionUser) => {
        resData.permissionUser = permissionUser
        res.data = resData
        return resData
      })
      .catch((e) => { throw e })
  }

  Model.beforeSave = (req, res, next) => {
    if (!Array.isArray(res.data)) {
      throw Error('beforeSave: res.data should have an array of removed records')
    }
    const ids = []
    const resData = res.data
    const PermissionUser = app.exModular.models.PermissionUser

    res.data.map((item) => { ids.push(item.permissionUserId) })
    return PermissionUser.removeAll({ whereIn: { column: PermissionUser.key, ids } })
      .then((permissionUser) => {
        resData.permissionUser = permissionUser
        res.data = resData
        return resData
      })
      .catch((e) => { throw e })
  }

  Model.afterSave = (req, res, next) => { next() }

  const resourcePath = Model.resourcePath ? Model.resourcePath : `/${Model.name.toLowerCase()}`

  Model.routes.create = {
    method: 'POST',
    name: `${Model.name}.create`,
    description: `Create new "${Model.name}"`,
    path: resourcePath,
    before: [
      app.exModular.auth.check,
      // app.exModular.access.check(`${Model.name}.create`),
      app.exModular.services.validator.checkBodyForArrayOfModel(Model, { optionalId: true }),
      Wrap(Model.beforeCheckPermission)
    ],
    handler: app.exModular.services.controllerDF.create(Model),
    after: [
      Wrap(Model.afterCreate),
      app.exModular.services.controllerDF.sendData
    ]
  }

  Model.routes.remove = {
    method: 'DELETE',
    name: `${Model.name}.remove`,
    description: `Delete single item in "${Model.name}" by id`,
    path: `${resourcePath}/:id`,
    before: [
      app.exModular.auth.check,
      // app.exModular.access.check(`${Model.name}.remove`),
      app.exModular.services.validator.paramId(Model)
    ],
    handler: app.exModular.services.controllerDF.remove(Model),
    after: [
      Wrap(Model.afterRemove),
      app.exModular.services.controllerDF.sendData
    ]
  }

  Model.routes.removeAll = {
    method: 'DELETE',
    name: `${Model.name}.${removeAllRouteName}`,
    description: `Delete all items from "${Model.name}"`,
    path: resourcePath,
    before: [
      app.exModular.auth.check
      // app.exModular.access.check(`${Model.name}.${removeAllRouteName}`)
    ],
    handler: app.exModular.services.controllerDF.removeAll(Model),
    after: [
      Wrap(Model.afterRemoveAll),
      app.exModular.services.controllerDF.sendData
    ]
  }

  Model.routes.save = {
    method: 'PUT',
    name: `${Model.name}.${saveRouteName}`,
    description: `Save (update) single item in "${Model.name}"`,
    path: `${resourcePath}/:id`,
    before: [
      app.exModular.auth.check,
      // app.exModular.access.check(`${Model.name}.${saveRouteName}`),
      app.exModular.services.validator.paramId(Model),
      app.exModular.services.validator.checkBodyForModel(Model, { optionalId: true }),
      Wrap(Model.beforeCheckPermission)
    ],
    handler: app.exModular.services.controllerDF.save(Model),
    after: [
      Wrap(Model.afterSave),
      app.exModular.services.controllerDF.sendData
    ]
  }
  return Model
}
