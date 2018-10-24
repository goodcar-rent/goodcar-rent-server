import { body, param } from 'express-validator/check'
import Controller from '../controllers/user-controller'
import paramCheck from '../services/param-check'

export default (app) => {
  const router = app.express.Router()
  const controller = Controller(app)

  // noinspection JSCheckFunctionSignatures
  router.route('/user')
    .all(app.auth.authenticate())
    .get(app.wrap(controller.list))
    .post(
      [
        body('email').isEmail().isLength({ min: 1 }).withMessage('Email should be provided'),
        body('password').isString().isLength({ min: 1 }).withMessage('Password should be provided'),
        body('invitedBy').optional().isString().withMessage('InvitedBy should be id'),
        body('inviteDate').optional().isBefore(Date.now()).withMessage('inviteDate should be less then now'),
        body('inviteId').optional().isUUID()
      ], paramCheck,
      app.wrap(controller.create))

  // noinspection JSCheckFunctionSignatures
  router.route('/user/:id')
    .all(app.auth.authenticate(),
      [
        param('id').isString().withMessage('id should be specified')
      ], paramCheck)
    .get(app.wrap(controller.item))
    .put(app.wrap(controller.save))
    .delete(app.wrap(controller.delete))

  return router
}