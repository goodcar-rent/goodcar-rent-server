import User from '../services/user-service'

export default module.exports = (app) => {
  return {
    User: User(app),
    ClearData: () => app.models.User.ClearData()
  }
}
