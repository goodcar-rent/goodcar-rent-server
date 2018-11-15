import { body, param } from 'express-validator/check'
import Controller from '../controllers/user-group-controller'
import paramCheck from '../services/param-check'
import { systemTypeAdmin, systemTypeGuest, systemTypeLoggedIn, systemTypeNone } from '../services/model-storage-memory/user-group'

export default (app) => {
  const router = app.express.Router()
  const controller = Controller(app)

  // noinspection JSCheckFunctionSignatures
  router.route('/user-group')
    // .all(app.auth.authenticate())
    .all(app.auth.ACL('user-group', 'read'))
    .get(app.wrap(controller.list))
    .post(app.auth.ACL('user-group', 'write'),
      [
        body('name').isString().isLength({ min: 1 }).withMessage('Name property should be provided for group'),
        body('systemType').optional().isIn([systemTypeAdmin, systemTypeGuest, systemTypeLoggedIn, systemTypeNone])
          .withMessage('systemType should be specified with predefined values'),
        body('users').optional().isArray().withMessage('Users should be array of iDs')
      ], paramCheck,
      app.wrap(controller.create))

  // noinspection JSCheckFunctionSignatures
  router.route('/user-group/:id')
    // .all(app.auth.authenticate(),
    .all(app.auth.ACL('user-group', 'read'),
      [
        param('id').isString().withMessage('id of group should be specified in URL')
      ], paramCheck)
    .get(app.wrap(controller.item))
    .put(app.auth.ACL('user-group', 'write'), app.wrap(controller.save))
    .delete(app.auth.ACL('user-group', 'write'), app.wrap(controller.delete))

  // noinspection JSCheckFunctionSignatures
  router.route('/user-group/:id/users')
    // .all(app.auth.authenticate(),
    .all(app.auth.ACL('user-group', 'read'),
      [
        param('id').isString().withMessage('id of group should be specified in URL')
      ], paramCheck)
    .get(app.wrap(controller.usersList))
    .post(app.auth.ACL('user-group', 'write'),
      [
        body('users').isArray().withMessage('Users property should be array of user\'s iDs')
      ], paramCheck,
      app.wrap(controller.usersAdd))
    .delete(app.auth.ACL('user-group', 'write'),
      [
        body('users').isArray().withMessage('Users property should be array of user\'s iDs')
      ], paramCheck,
      app.wrap(controller.usersRemove))

  return router
}
