import { body, param } from 'express-validator/check'
import InviteController from '../controllers/invite-controller'
import paramCheck from '../services/param-check'
import { ACL_INVITE, ACL_READ, ACL_WRITE } from '../config/acl-consts'

export default (app) => {
  const router = app.express.Router()
  const controller = InviteController(app)
  const mountPath = '/auth/invite'

  // noinspection JSCheckFunctionSignatures
  router.route(mountPath)
    // .all(app.auth.authenticate())
    .all(app.auth.ACL(ACL_INVITE, ACL_READ))
    .get(app.wrap(controller.list))
    .post(app.auth.ACL(ACL_INVITE, ACL_WRITE),
      [
        body('email').isEmail().isLength({ min: 5 }).withMessage('Email should be provided'),
        body('expireAt').optional().isAfter().withMessage('ExpireAt should be greater than now'),
        body('disabled').optional().isBoolean().withMessage('Invite disabled state should be boolean value'),
        body('createdBy').optional().isString(),
        body('assignUserGroups').optional().isArray()
      ], paramCheck,
      app.wrap(controller.create))

  // noinspection JSCheckFunctionSignatures
  router.route(`${mountPath}/:id`)
    .all(app.auth.ACL(ACL_INVITE, ACL_READ),
    // .all(app.auth.authenticate(),
      [
        param('id').isString().withMessage('Invite id should be specified')
      ], paramCheck)
    .get(app.wrap(controller.item))
    .put(app.auth.ACL(ACL_INVITE, ACL_WRITE),
      [
        body('email').optional().isEmail().isLength({ min: 5 }).withMessage('Email should be provided'),
        body('expireAt').optional().isAfter().withMessage('ExpireAt should be greater than now'),
        body('disabled').optional().isBoolean().withMessage('Invite disabled state should be boolean value'),
        body('createdBy').optional().isString(),
        body('assignUserGroups').optional().isArray()
      ], paramCheck,
      app.wrap(controller.save))
    .delete(app.auth.ACL(ACL_INVITE, ACL_WRITE), app.wrap(controller.delete))

  router.route(`${mountPath}/:id/send`)
    .all(app.auth.ACL(ACL_INVITE, ACL_WRITE),
    // .all(app.auth.authenticate(),
      [
        param('id').isString().withMessage('Invite id should be specified')
      ], paramCheck)
    .get(app.wrap(controller.send))

  return router
}
