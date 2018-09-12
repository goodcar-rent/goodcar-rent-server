/* eslint-disable no-param-reassign */
import passport from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import User from '../services/user'

export default module.exports = (app) => {
  const env = app.env
  const params = {
    secretOrKey: env.jwtSecret,
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
