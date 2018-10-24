import User from '../services/user'
import Invite from '../services/invite'
import UserGroup from '../services/user-group'
import Login from '../services/login'

export default module.exports = (app) => {
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
        .catch((err) => { throw err})
  }
  models.User.name = 'User'
  models.Invite.name = 'Invite'
  models.UserGroup.name = 'UserGroup'
  models.Login.name = 'Login'

  app.asyncInit.push(models.UserGroup.createSystemData())
  return models
}
