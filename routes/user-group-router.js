import { body, param } from 'express-validator/check'
import Controller from '../controllers/user-group-controller'
import paramCheck from '../services/param-check'
import { systemTypeAdmin, systemTypeGuest, systemTypeLoggedIn, systemTypeNone } from '../services/user-group'

export default (app) => {
  const router = app.express.Router()
  const controller = Controller(app)

  // noinspection JSCheckFunctionSignatures
  router.route('/user-group')
    .all(app.auth.authenticate())
    .get(app.wrap(controller.list))
    .post(
      [
        body('name').isString().isLength({ min: 1 }).withMessage('Name should be provided'),
        body('systemType').optional().isIn([systemTypeAdmin, systemTypeGuest, systemTypeLoggedIn, systemTypeNone]).withMessage('systemType should be specified with predefined values'),
        body('users').optional().isArray().withMessage('Users should be array of iDs')
      ], paramCheck,
      app.wrap(controller.create))

  // noinspection JSCheckFunctionSignatures
  router.route('/user-group/:id')
    .all(app.auth.authenticate(),
      [
        param('id').isString().withMessage('id should be specified')
      ], paramCheck)
    .get(app.wrap(controller.item))
    .put(app.wrap(controller.save))
    .delete(app.wrap(controller.delete))

  return router
}
