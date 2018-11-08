import { param } from 'express-validator/check'
import Controller from '../controllers/login-controller'
import paramCheck from '../services/param-check'

export default (app) => {
  const router = app.express.Router()
  const controller = Controller(app)

  // noinspection JSCheckFunctionSignatures
  router.route('/login')
    .all(app.auth.ACL('login', 'read'))
    .get(app.wrap(controller.list))

  // noinspection JSCheckFunctionSignatures
  router.route('/login/:id')
    .all(app.auth.ACL('login', 'read'),
      [
        param('id').isString().withMessage('id should be specified')
      ], paramCheck)
    .get(app.wrap(controller.item))
    .delete(app.auth.ACL('login', 'write'), app.wrap(controller.delete))

  return router
}
