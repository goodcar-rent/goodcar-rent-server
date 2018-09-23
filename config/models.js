import User from '../services/user'
import Invite from '../services/invite'

export default module.exports = (app) => {
  return {
    User: User(app),
    Invite: Invite(app),
    ClearData: () =>
      app.models.User.ClearData()
        .then(() => app.models.Invite.ClearData())
  }
}
