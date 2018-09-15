/* eslint-disable no-param-reassign */
import passport from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import UserService from '../services/user-service'

export default module.exports = (app) => {
  const User = UserService(app)
  const params = {
    secretOrKey: app.env.JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  }
  const strategy = new Strategy(params, (payload, done) => {
    User.findById(payload.id)
      .then((user) => {
        if (user) {
          return {
            id: user.id,
            email: user.email,
          }
        }
        return false
      })
      .asCallback(done)
      .catch(error => done(error, null))
  })
  passport.use(strategy)
  app.auth = {
    passport,
    initialize: () => passport.initialize(),
    authenticate: () => passport.authenticate('jwt', env.jwtSession),
  }
  return passport
}
