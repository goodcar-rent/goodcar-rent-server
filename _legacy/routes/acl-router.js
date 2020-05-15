import { body, param } from 'express-validator/check'
import Controller from '../controllers/acl-controller'
import paramCheck from '../services/param-check'
import { ACL_READ, ACL_WRITE, ACL_USER_ACLS, ACL_USER_GROUP_ACLS } from '../config/acl-consts'

export default (app) => {
  const router = app.express.Router()
  const controller = Controller(app)

  // noinspection JSCheckFunctionSignatures
  router.route('/acl/user-acls/:userId')
    .all(
      [param('userId').isUUID().isLength({ min: 1 }).withMessage('userId should be provided')],
      app.auth.ACL(ACL_USER_ACLS, ACL_READ))
    .get(app.wrap(controller.list))
    .post(app.auth.ACL(ACL_USER_ACLS, ACL_WRITE),
      [
        body('object').isString().isLength({ min: 1 }).withMessage('object should be provided'),
        body('permission').isString().isLength({ min: 1 }).withMessage('permission should be provided'),
        body('kind').optional().isString().isIn([app.consts.kindAllow, app.consts.kindDeny])
          .withMessage('kind should be specified with predefined values')
      ], paramCheck,
      app.wrap(controller.create))

  // noinspection JSCheckFunctionSignatures
  router.route('/acl/user-group-acls/:groupId')
    .all(
      [param('groupId').isUUID().isLength({ min: 1 }).withMessage('groupId should be provided in URL')],
      app.auth.ACL(ACL_USER_GROUP_ACLS, ACL_READ))
    .get(app.wrap(controller.userGroupListACL))
    .post(app.auth.ACL(ACL_USER_GROUP_ACLS, ACL_WRITE),
      [
        body('object').isString().isLength({ min: 1 }).withMessage('object should be provided'),
        body('permission').isString().isLength({ min: 1 }).withMessage('permission should be provided'),
        body('kind').optional().isString().isIn([app.consts.kindAllow, app.consts.kindDeny])
          .withMessage('kind should be specified with predefined values')
      ], paramCheck,
      app.wrap(controller.userGroupCreate))
  return router
}
