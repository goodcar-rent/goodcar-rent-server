import { body, param } from 'express-validator/check'
import InviteController from '../controllers/invite-controller'

export default (app) => {
  const router = app.express.Router()
  const controller = InviteController(app)

  // noinspection JSCheckFunctionSignatures
  router.route('/invite')
    .all(app.auth.authenticate())
    .get(app.wrap(controller.list))
    .post(
      [
        body('email').isEmail().isLength({ min: 5 }).withMessage('Email should be provided'),
        body('expireAt').optional().isAfter().withMessage('ExpireAt should be greater than now'),
        body('disabled').optional().isBoolean().withMessage('Invite disabled state should be boolean value')
      ],
      app.wrap(controller.create))

  // noinspection JSCheckFunctionSignatures
  router.route('/invite/:id')
    .all(app.auth.authenticate(),
      [
        param('id').isString().withMessage('Invite id should be specified')
      ])
    .get(app.wrap(controller.item))
    .put(app.wrap(controller.save))
    .delete(app.wrap(controller.delete))

  return router
}
