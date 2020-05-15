import jwt from 'jsonwebtoken'

const packageName = 'Auth-jwt'
const DEF_SECRET = 'jhwckjeqfjnqwdoijed'

export const AuthJwt = (app) => {
  app.exModular.modules.Add({
    moduleName: packageName,
    dependency: [
      'services.errors',
      'services.errors.ServerError',
      'services.errors.ServerNotAllowed',
      'models.Session',
      'models.User'
    ]
  })

  // define methods on app.auth path:
  // encode sessionID into JWT:
  const encode = (sessionId) =>
    jwt.sign({ id: sessionId }, app.env.JWT_SECRET ? app.env.JWT_SECRET : DEF_SECRET, { expiresIn: '1h' })

  // parse req header and extract schema/token
  const getTokenFromReq = (req) => {
    const pattern = /(\S+)\s+(\S+)/
    const headerValue = req.get('authorization')
    if (typeof headerValue !== 'string') {
      return null
    }
    const parsedHeaderValue = headerValue.match(pattern)
    return parsedHeaderValue && { scheme: parsedHeaderValue[1].toLowerCase(), token: parsedHeaderValue[2] }
  }

  // middleware to check session in JWT, lod if from storage and load user profile:
  const check = (req, res, next) => {
    const Session = app.exModular.models.Session
    const User = app.exModular.models.User
    const Errors = app.exModular.services.errors

    const auth = app.auth.getTokenFromReq(req)
    if (auth && auth.scheme === 'bearer') {
      // we have some token
      try {
        const payload = jwt.verify(auth.token, app.env.JWT_SECRET ? app.env.JWT_SECRET : DEF_SECRET, { clockTolerance: 3 })
        let aSession = {}
        Session.findById(payload.id)
          .then((session) => {
            if (!session) {
              return next(new Errors.ServerNotAllowed('session not registered'), null)
            }
            if (!session.createdAt || !session.userId) {
              return next(new Errors.ServerNotAllowed('session structure is invalid'), null)
            }
            aSession = session
            return User.findById(session.userId)
          })
          .then((user) => {
            if (!user) {
              return next(new Errors.ServerNotAllowed('User not found'), null)
            }
            req.user = user
            req.user.session = aSession
            req.user.jwt = payload
            next()
          })
          .catch(e => next(e))
      } catch (e) {
        next(e)
      }
    } else {
      next(new Error('Auth failed, no auth header or unknown scheme'))
    }
  }

  return {
    encode,
    getTokenFromReq,
    check
  }
}
