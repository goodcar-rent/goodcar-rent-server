import { MeGrant } from './models/model-me-grant'
import { MeAccess } from './models/model-me-access'
// import { listRouteName } from './route-builder'

const packageName = 'Me'

export const Me = (app) => {
  const Module = {
    moduleName: packageName,
    dependency: [
      'auth.check',
      'modules.Add',
      'routes.Add'
    ],
    module: {}
  }

  app.exModular.modules.Add(Module)

  /**
   * me: контроллер маршрута me. Возвращает профиль текущего пользователя. Для
   * администратора возвращаются идентификкаторы системных групп: adminGroupId,
   * loggedGroupId
   */
  Module.module.me = (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        res.data = req.user
        if (res.data.password) {
          delete res.data.password
        }

        return app.exModular.access.isAdmin(req.user)
      })
      .then((_isAdmin) => {
        if (_isAdmin) {
          res.data.adminGroupId = app.exModular.access.ADMIN_GROUP_ID
          res.data.loggedGroupId = app.exModular.access.LOGGED_GROUP_ID
        }
      })
      .catch((e) => { throw e })
  }

  /**
   * meGroups: получить список групп текущего пользователя
   * @param req
   * @param res
   */
  Module.module.meGroups = (req, res, next) => {
    return app.exModular.access.getUserGroups(req.user)
      .then((_groups) => {
        if (!_groups) {
          throw Error('Failed to get groups for user')
        }
        if (!Array.isArray(_groups)) {
          _groups = [_groups]
        }
        res.data = []
        _groups.map((group) => res.data.push({ id: group.id, name: group.name, systemType: group.systemType }))
      })
      .catch((e) => { throw e })
  }

  Module.module.routes = [
    {
      name: 'Me',
      method: 'GET',
      path: '/me',
      before: [
        app.exModular.auth.check,
        app.exModular.access.check('Me')
      ],
      handler: Module.module.me,
      after: app.exModular.services.controllerDF.sendData

    },
    {
      name: 'Me.Groups',
      method: 'GET',
      path: '/me/groups',
      before: [
        app.exModular.auth.check,
        app.exModular.access.check('Me.Groups')
      ],
      handler: Module.module.meGroups,
      after: app.exModular.services.controllerDF.sendData
    }
  ]

  app.exModular.routes.Add(Module.module.routes)

  app.exModular.modelAdd(MeGrant(app))
  app.exModular.modelAdd(MeAccess(app))

  return app
}
