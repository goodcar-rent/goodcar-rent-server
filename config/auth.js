/* eslint-disable no-param-reassign */
import passport from 'passport'
import _ from 'lodash'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { ServerNotAllowed } from './errors'
import Acl from '../services/acl'

const loginTTL = 1000 * 60 * 24 // 24h in milliseconds

export default module.exports = (app) => {
  const { Login, User } = app.models
  const params = {
    secretOrKey: app.env.JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
  }
  const strategy = new Strategy(params, (payload, done) => {
    let loginId = null
    Login.findById(payload.id)
      .then((login) => {
        if (!login) {
          return done(new ServerNotAllowed('Login not registered'), null)
        }
        if (!login.createdAt || !login.userId) {
          return done(new ServerNotAllowed('Login structure is invalid'), null)
        }
        if ((Date.now() - login.createdAt) > loginTTL) {
          return done(new ServerNotAllowed('Login expired'), null)
        }
        loginId = login.id
        return User.findById(login.userId)
      })
      .then((user) => {
        if (!user) {
          return done(new ServerNotAllowed('User not found'), null)
        } else {
          return done(null, {
            id: user.id,
            email: user.email,
            loginId
          })
        }
      })
      .catch(error => done(error, null))
  })
  passport.use(strategy)
  app.auth = {
    passport,
    initialize: () => passport.initialize(),
    authenticate: () => passport.authenticate('jwt', { session: false })
  }
  _.merge(app.auth, Acl(app))
  return passport
}
