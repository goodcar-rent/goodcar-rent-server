import Storage from './storage'
import User from '../models/user'
import Invite from '../models/invite'
import UserGroup from '../models/user-group'
import Login from '../models/login'
import Cars from '../models/cars'

export default module.exports = (app) => {
  // init storage via storage service
  app.storage = Storage(app)

  const models = {
    User: User(app),
    Invite: Invite(app),
    UserGroup: UserGroup(app),
    Login: Login(app),
    Cars: Cars(app),
    clearData: () =>
      app.models.User.clearData()
        .then(() => app.models.Invite.clearData())
        .then(() => app.models.UserGroup.clearData())
        .then(() => app.models.Login.clearData())
        .then(() => app.models.Cars.clearData())
        .catch((err) => { throw err }),
    initData: () =>
      models.User.initData()
        .then(() => models.Invite.initData())
        .then(() => models.Login.initData())
        .then(() => models.UserGroup.initData())
        .then(() => models.Cars.initData()),
    initPermissions: () =>
      Promise.resolve(app.auth.AddGroupPermission(
        models.UserGroup.systemGroupLoggedIn(),
        'me',
        'read',
        app.consts.kindAllow)),
    init: () =>
      app.storage.initStorage()
        .then(() => app.models.initData())
        .then(() => {
          if (process.env.START_FRESH) {
            return models.UserGroup.createSystemData()
          }
        })
        .then(() => app.models.initPermissions())
        .then(() => { return app })
        .catch((err) => { throw err })
  }

  return models
}
