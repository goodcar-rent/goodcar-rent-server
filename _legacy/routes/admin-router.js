import AdminController from '../controllers/admin-controller'
import { ACL_READ, ACL_WRITE, ACL_ADMIN } from '../config/acl-consts'

export default (app) => {
  const router = app.express.Router()
  const controller = AdminController(app)

  // noinspection JSCheckFunctionSignatures
  router.route('/admin/seed/userGroups')
    // .all(app.auth.authenticate())
    .all(app.auth.ACL(ACL_ADMIN, ACL_READ))
    .get(app.wrap(controller.seedUserGroups))

  router.get('/admin/clearData',
    // .all(app.auth.authenticate())
    app.auth.ACL(ACL_ADMIN, ACL_WRITE),
    app.wrap(controller.seedUserGroups))

  return router
}
