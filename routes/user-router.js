import { body, param } from 'express-validator/check'
import Controller from '../controllers/user-controller'
import PermissionsController from '../controllers/user-permissions-controller'
import paramCheck from '../services/param-check'

export default (app) => {
  const router = app.express.Router()
  const controller = Controller(app)
  const permissionsController = PermissionsController(app)

  // noinspection JSCheckFunctionSignatures
  router.route('/user')
    // .all(app.auth.authenticate())
    .all(app.auth.ACL('user', 'read'))
    .get(app.wrap(controller.list))
    .post(app.auth.ACL('user', 'write'),
      [
        body('email').isEmail().isLength({ min: 1 }).withMessage('Email should be provided'),
        body('password').isString().isLength({ min: 1 }).withMessage('Password should be provided'),
        body('invitedBy').optional().isString().withMessage('InvitedBy should be id'),
        body('inviteDate').optional().isBefore(Date.now()).withMessage('inviteDate should be less then now'),
        body('inviteId').optional().isUUID().withMessage('"inviteId" property should be UUID type'),
        body('disabled').optional().isBoolean().withMessage('"disabled" property should be boolean type')
      ], paramCheck,
      app.wrap(controller.create))

  // noinspection JSCheckFunctionSignatures
  router.route('/user/:id')
    // .all(app.auth.authenticate(),
    .all(app.auth.ACL('user', 'read'),
      [
        param('id').isString().withMessage('id should be specified')
      ], paramCheck)
    .get(app.wrap(controller.item))
    .put(app.auth.ACL('user', 'write'),
      [
        body('email').optional().isEmail().isLength({ min: 1 }).withMessage('Email should be provided'),
        body('password').optional().isString().isLength({ min: 1 }).withMessage('Password should be provided'),
        body('invitedBy').optional().isString().withMessage('InvitedBy should be id'),
        body('inviteDate').optional().isBefore(Date.now()).withMessage('inviteDate should be less then now'),
        body('inviteId').optional().isUUID().withMessage('"inviteId" property should be UUID type'),
        body('disabled').optional().isBoolean().withMessage('"disabled" property should be boolean type')
      ], paramCheck,
      app.wrap(controller.save))
    .delete(app.auth.ACL('user', 'write'), app.wrap(controller.delete))

  // User permissions management routes:
  router.route('/user/:userId/permissions')
    // .all(app.auth.authenticate(),
    .all(app.auth.ACL('user', 'read'),
      [
        param('userId').isString().withMessage('id should be specified')
      ], paramCheck)
    .get(app.wrap(permissionsController.permissionsList))
    .post(app.auth.ACL('user', 'write'),
      [
        body('object').isString().isLength({ min: 1 }).withMessage('object should be provided'),
        body('permission').isString().isLength({ min: 1 }).withMessage('permission should be provided'),
        body('kind').optional().isString().isIn([app.auth.kindAllow, app.auth.kindDeny])
          .withMessage('kind should be specified with predefined values')
      ], paramCheck,
      app.wrap(permissionsController.permissionsCreate))

  return router
}
