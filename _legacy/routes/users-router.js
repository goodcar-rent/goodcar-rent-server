import { body, param } from 'express-validator/check'
import Controller from '../controllers/user-controller'
import PermissionsController from '../controllers/user-permissions-controller'
import paramCheck from '../services/param-check'
import { ACL_READ, ACL_USERS, ACL_WRITE } from '../config/acl-consts'

export default (app) => {
  const router = app.express.Router()
  const controller = Controller(app)
  const permissionsController = PermissionsController(app)

  // noinspection JSCheckFunctionSignatures
  router.route('/users')
    // .all(app.auth.authenticate())
    .all(app.auth.ACL(ACL_USERS, ACL_READ))
    .get(app.wrap(controller.list))
    .post(app.auth.ACL(ACL_USERS, ACL_WRITE),
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
  router.route('/users/:id')
    // .all(app.auth.authenticate(),
    .all(app.auth.ACL(ACL_USERS, ACL_READ),
      [
        param('id').isString().withMessage('id should be specified')
      ], paramCheck)
    .get(app.wrap(controller.item))
    .put(app.auth.ACL(ACL_USERS, ACL_WRITE),
      [
        body('email').optional().isEmail().isLength({ min: 1 }).withMessage('Email should be provided'),
        body('password').optional().isString().isLength({ min: 1 }).withMessage('Password should be provided'),
        body('invitedBy').optional().isString().withMessage('InvitedBy should be id'),
        body('inviteDate').optional().isBefore(Date.now()).withMessage('inviteDate should be less then now'),
        body('inviteId').optional().isUUID().withMessage('"inviteId" property should be UUID type'),
        body('disabled').optional().isBoolean().withMessage('"disabled" property should be boolean type')
      ], paramCheck,
      app.wrap(controller.save))
    .delete(app.auth.ACL(ACL_USERS, ACL_WRITE), app.wrap(controller.delete))

  // User permissions management routes:
  router.route('/users/:userId/permissions')
    // .all(app.auth.authenticate(),
    .all(app.auth.ACL(ACL_USERS, ACL_READ),
      [
        param('userId').isString().withMessage('id should be specified')
      ], paramCheck)
    .get(app.wrap(permissionsController.permissionsList))
    .post(app.auth.ACL(ACL_USERS, ACL_WRITE),
      [
        body('object').isString().isLength({ min: 1 }).withMessage('object should be provided'),
        body('permission').isString().isLength({ min: 1 }).withMessage('permission should be provided'),
        body('kind').optional().isString().isIn([app.consts.kindAllow, app.consts.kindDeny])
          .withMessage('kind should be specified with predefined values')
      ], paramCheck,
      app.wrap(permissionsController.permissionsCreate))

  return router
}
