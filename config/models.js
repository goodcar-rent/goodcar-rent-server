export default module.exports = (app) => {
  let ModelPath = '../services/model-storage-memory'
  if (app.env.APP_STORAGE === 'memory') {
    ModelPath = '../services/model-storage-memory'
  } else if (app.env.APP_STORAGE === 'sqlite') {
    ModelPath = '../services/model-storage-sqlite'
  }

  const User = require(`${ModelPath}/user`)
  const Invite = require(`${ModelPath}/invite`)
  const UserGroup = require(`${ModelPath}/user-group`)
  const Login = require(`${ModelPath}/login`)

  const models = {
    User: User(app),
    Invite: Invite(app),
    UserGroup: UserGroup(app),
    Login: Login(app),
    ClearData: () =>
      app.models.User.ClearData()
        .then(() => app.models.Invite.ClearData())
        .then(() => app.models.UserGroup.ClearData())
        .then(() => app.models.Login.ClearData())
        .catch((err) => { throw err })
  }
  models.User.name = 'User'
  models.Invite.name = 'Invite'
  models.UserGroup.name = 'UserGroup'
  models.Login.name = 'Login'

  app.asyncInit.push(
    models.UserGroup.createSystemData()
      .then(() => {
        app.auth.AddGroupPermission(
          models.UserGroup.systemGroupLoggedIn(),
          'me',
          'read',
          app.consts.kindAllow)
      })
  )
  return models
}
