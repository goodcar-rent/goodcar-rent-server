import Storage from './storage'

export default module.exports = (app) => {
  // init storage via storage service
  Storage(app)

  const ModelPath = app.storage.modelPath
  const User = require(`${ModelPath}/user`)
  const Invite = require(`${ModelPath}/invite`)
  const UserGroup = require(`${ModelPath}/user-group`)
  const Login = require(`${ModelPath}/login`)

  const models = {
    User: User(app),
    Invite: Invite(app),
    UserGroup: UserGroup(app),
    Login: Login(app),
    clearData: () =>
      app.models.User.clearData()
        .then(() => app.models.Invite.clearData())
        .then(() => app.models.UserGroup.clearData())
        .then(() => app.models.Login.clearData())
        .catch((err) => { throw err }),
    initData: () =>
      models.User.initData()
        .then(() => models.Invite.initData())
        .then(() => models.Login.initData())
        .then(() => models.UserGroup.initData()),
    initPermissions: () =>
      Promise.resolve(app.auth.AddGroupPermission(
        models.UserGroup.systemGroupLoggedIn(),
        'me',
        'read',
        app.consts.kindAllow))
  }
  models.User.name = 'User'
  models.Invite.name = 'Invite'
  models.UserGroup.name = 'UserGroup'
  models.Login.name = 'Login'

  app.modelsInit = () =>
    app.storage.initStorage(app)
      .then(() => app.models.initData())
      .then(() => {
        if (process.env.START_FRESH) {
          return models.UserGroup.createSystemData()
        }
      })
      .then(() => app.models.initPermissions())
      .then(() => { return app })
      .catch((err) => { throw err })

  return models
}
