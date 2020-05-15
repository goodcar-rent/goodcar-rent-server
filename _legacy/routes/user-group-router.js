import { body, param } from 'express-validator/check'
import Controller from '../controllers/user-group-controller'
import paramCheck from '../services/param-check'
import { ACL_READ, ACL_USER_GROUPS, ACL_WRITE } from '../config/acl-consts'

export default (app) => {
  const router = app.express.Router()
  const controller = Controller(app)

  // noinspection JSCheckFunctionSignatures
  router.route('/user-groups')
    // .all(app.auth.authenticate())
    .all(app.auth.ACL(ACL_USER_GROUPS, ACL_READ))
    .get(app.wrap(controller.list))
    .post(app.auth.ACL(ACL_USER_GROUPS, ACL_WRITE),
      [
        body('name').isString().isLength({ min: 1 }).withMessage('Name property should be provided for group'),
        body('systemType').optional().isIn([
          app.models.UserGroup.systemTypeAdmin,
          app.models.UserGroup.systemTypeGuest,
          app.models.UserGroup.systemTypeLoggedIn,
          app.models.UserGroup.systemTypeNone])
          .withMessage('systemType should be specified with predefined values'),
        body('users').optional().isArray().withMessage('Users should be array of iDs')
      ], paramCheck,
      app.wrap(controller.create))

  // noinspection JSCheckFunctionSignatures
  router.route('/user-groups/:id')
    // .all(app.auth.authenticate(),
    .all(app.auth.ACL(ACL_USER_GROUPS, ACL_READ),
      [
        param('id').isString().withMessage('id of group should be specified in URL'),
      ], paramCheck)
    .get(app.wrap(controller.item))
    .put(app.auth.ACL(ACL_USER_GROUPS, ACL_WRITE),
      [
        body('id').optional().isString().withMessage('id of group should be specified in URL'),
        body('name').optional().isString().isLength({ min: 1 }).withMessage('Name property should be provided for group'),
        body('systemType').optional().isIn([
          app.models.UserGroup.systemTypeAdmin,
          app.models.UserGroup.systemTypeGuest,
          app.models.UserGroup.systemTypeLoggedIn,
          app.models.UserGroup.systemTypeNone])
          .withMessage('systemType should be specified with predefined values'),
        body('users').optional().isArray().withMessage('Users should be array of iDs')
      ], paramCheck,
      app.wrap(controller.save))
    .delete(app.auth.ACL(ACL_USER_GROUPS, ACL_WRITE), app.wrap(controller.delete))

  // noinspection JSCheckFunctionSignatures
  router.route('/user-groups/:id/users')
    // .all(app.auth.authenticate(),
    .all(app.auth.ACL(ACL_USER_GROUPS, ACL_READ),
      [
        param('id').isString().withMessage('id of group should be specified in URL')
      ], paramCheck)
    .get(app.wrap(controller.usersList))
    .post(app.auth.ACL(ACL_USER_GROUPS, ACL_WRITE),
      [
        body('users').isArray().withMessage('Users property should be array of user\'s iDs')
      ], paramCheck,
      app.wrap(controller.usersAdd))
    .delete(app.auth.ACL(ACL_USER_GROUPS, ACL_WRITE),
      [
        body('users').isArray().withMessage('Users property should be array of user\'s iDs')
      ], paramCheck,
      app.wrap(controller.usersRemove))

  return router
}
