import { MeGrant } from './model-me-grant'
import { MeAccess } from './model-me-access'

const packageName = 'Me'

export const Me = (app) => {
  const Module = {
    moduleName: packageName,
    dependency: [
      'auth.check',
      'services.sendJson',
      'modules.Add',
      'routes.Add'
    ],
    module: {}
  }

  app.exModular.modules.Add(Module)

  Module.module.me = (req, res, next) => {
    return Promise.resolve()
      .then(() => {
        res.payload = req.user
        if (res.payload.password) {
          delete res.payload.password
        }
        return next()
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
        res.payload = _groups
        return next()
      })
      .catch((e) => {
        res.error = e
        return next(e)
      })
  }

  Module.module.routes = [
    {
      name: 'Me',
      method: 'GET',
      path: '/me',
      before: app.exModular.auth.check,
      handler: Module.module.me,
      after: app.exModular.services.sendJson
    },
    {
      name: 'Me.Groups',
      method: 'GET',
      path: '/me/groups',
      before: app.exModular.auth.check,
      handler: Module.module.meGroups,
      after: app.exModular.services.sendJson
    }
  ]

  app.exModular.routes.Add(Module.module.routes)

  app.exModular.modelAdd(MeGrant(app))
  app.exModular.modelAdd(MeAccess(app))

  return app
}
