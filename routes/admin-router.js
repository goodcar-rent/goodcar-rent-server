import AdminController from '../controllers/admin-controller'

export default (app) => {
  const router = app.express.Router()
  const controller = AdminController(app)

  // noinspection JSCheckFunctionSignatures
  router.route('/admin/seed/userGroups')
    // .all(app.auth.authenticate())
    .all(app.auth.ACL('admin', 'read'))
    .get(app.wrap(controller.seedUserGroups))

  router.get('/admin/clearData',
    // .all(app.auth.authenticate())
    app.auth.ACL('admin', 'read'),
    app.wrap(controller.seedUserGroups))

  return router
}
