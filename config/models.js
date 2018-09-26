import User from '../services/user'
import Invite from '../services/invite'
import UserGroup from '../services/user-group'

export default module.exports = (app) => {
  return {
    User: User(app),
    Invite: Invite(app),
    UserGroup: UserGroup(app),
    ClearData: () =>
      app.models.User.ClearData()
        .then(() => app.models.Invite.ClearData())
        .then(() => app.models.UserGroup.ClearData())
  }
}
