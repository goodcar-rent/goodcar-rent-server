/* eslint-disable no-param-reassign */
import passport from 'passport'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { ServerNotAllowed } from './errors'

export default module.exports = (app) => {
  const { User } = app.models
  const params = {
    secretOrKey: app.env.JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  }
  const strategy = new Strategy(params, (payload, done) => {
    User.findById(payload.id)
      .then((user) => {
        if (user) {
          return done(null, {
            id: user.id,
            email: user.email
          })
        }
        return done(new ServerNotAllowed('User not found!'), null)
      })
      .catch(error => done(error, null))
  })
  passport.use(strategy)
  app.auth = {
    passport,
    initialize: () => passport.initialize(),
    authenticate: () => passport.authenticate('jwt', { session: false })
  }
  return passport
}
