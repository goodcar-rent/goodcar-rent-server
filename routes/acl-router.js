import { body, param } from 'express-validator/check'
import Controller from '../controllers/acl-controller'
import paramCheck from '../services/param-check'

export default (app) => {
  const router = app.express.Router()
  const controller = Controller(app)

  // noinspection JSCheckFunctionSignatures
  router.route('/acl/user/:userId')
    .all(
      [param('userId').isUUID().isLength({ min: 1 }).withMessage('userId should be provided')],
      app.auth.ACL('acl/user', 'read'))
    .get(app.wrap(controller.list))
    .post(app.auth.ACL('acl/user', 'write'),
      [
        body('object').isString().isLength({ min: 1 }).withMessage('object should be provided'),
        body('permission').isString().isLength({ min: 1 }).withMessage('permission should be provided'),
        body('kind').optional().isString().isIn([app.consts.kindAllow, app.consts.kindDeny])
          .withMessage('kind should be specified with predefined values')
      ], paramCheck,
      app.wrap(controller.create))

  // noinspection JSCheckFunctionSignatures
  router.route('/acl/user-groups/:groupId')
    .all(
      [param('groupId').isUUID().isLength({ min: 1 }).withMessage('groupId should be provided in URL')],
      app.auth.ACL('acl/user-group', 'read'))
    .get(app.wrap(controller.userGroupListACL))
    .post(app.auth.ACL('acl/user-groups', 'write'),
      [
        body('object').isString().isLength({ min: 1 }).withMessage('object should be provided'),
        body('permission').isString().isLength({ min: 1 }).withMessage('permission should be provided'),
        body('kind').optional().isString().isIn([app.consts.kindAllow, app.consts.kindDeny])
          .withMessage('kind should be specified with predefined values')
      ], paramCheck,
      app.wrap(controller.userGroupCreate))
  return router
}
