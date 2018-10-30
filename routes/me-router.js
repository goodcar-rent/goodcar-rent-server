import MeController from '../controllers/me-controller'

export default (app) => {
  const router = app.express.Router()
  const controller = MeController(app)

  // noinspection JSCheckFunctionSignatures
  router.route('/me')
    .all(app.auth.authenticate())
    // .all(app.auth.ACL('me', 'read'))
    .get(app.wrap(controller.me))

  router.route('/me/permissions')
    .all(app.auth.authenticate())
    // .all(app.auth.ACL('me', 'read'))
    .get(app.wrap(controller.permissions))

  return router
}
