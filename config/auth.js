/* eslint-disable no-param-reassign */
import passport from 'passport'
import _ from 'lodash'
import { Strategy, ExtractJwt } from 'passport-jwt'
import { ServerNotAllowed } from './errors'
import Acl from '../services/acl'

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
  _.merge(app.auth, Acl(app))
  return passport
}
