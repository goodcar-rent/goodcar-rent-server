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
        body('name').isString().isLength({ min: 1 }).withMessage('Name property should be provided for group'),
        body('systemType').optional().isIn([systemTypeAdmin, systemTypeGuest, systemTypeLoggedIn, systemTypeNone])
          .withMessage('systemType should be specified with predefined values'),
        body('users').optional().isArray().withMessage('Users should be array of iDs')
      ], paramCheck,
      app.wrap(controller.create))

  // noinspection JSCheckFunctionSignatures
  router.route('/user-group/:id')
    .all(app.auth.authenticate(),
      [
        param('id').isString().withMessage('id of group should be specified in URL')
      ], paramCheck)
    .put(app.wrap(controller.save))
    .get(app.wrap(controller.item))
    .delete(app.wrap(controller.delete))

  // noinspection JSCheckFunctionSignatures
  router.route('/user-group/:id/users')
    .all(app.auth.authenticate(),
      [
        param('id').isString().withMessage('id of group should be specified in URL')
      ], paramCheck)
    .get(app.wrap(controller.usersList))
    .post(
      [
        body('users').isArray().withMessage('Users property should be array of user\'s iDs')
      ], paramCheck,
      app.wrap(controller.usersAdd))
    .delete(
      [
        body('users').isArray().withMessage('Users property should be array of user\'s iDs')
      ], paramCheck,
      app.wrap(controller.usersRemove))

  return router
}
