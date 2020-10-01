import jwt from 'jsonwebtoken'

const packageName = 'Auth-jwt'
const DEF_SECRET = 'jhwckjeqfjnqwdoijed'

export const AuthJwt = (app) => {
  const Module = {
    moduleName: packageName,
    dependency: [
      'services.errors',
      'services.errors.ServerError',
      'services.errors.ServerNotAllowed',
      'models.Session',
      'models.User'
    ],
    module: {}
  }

  app.exModular.modules.Add(Module)

  // define methods on app.auth path:
  // encode sessionID into JWT:
  Module.module.encode = (sessionId) =>
    jwt.sign({ id: sessionId }, app.env.JWT_SECRET ? app.env.JWT_SECRET : DEF_SECRET, { expiresIn: '1h' })

  // parse req header and extract schema/token
  Module.module.getTokenFromReq = (req) => {
    const pattern = /(\S+)\s+(\S+)/
    const headerValue = req.get('authorization')
    if (typeof headerValue !== 'string') {
      return null
    }
    const parsedHeaderValue = headerValue.match(pattern)
    return parsedHeaderValue && { scheme: parsedHeaderValue[1].toLowerCase(), token: parsedHeaderValue[2] }
  }

  // middleware to check session in JWT, lod if from storage and load user profile:
  Module.module.check = (req, res, next) => {
    const Session = app.exModular.models.Session
    const SessionSocial = app.exModular.models.SessionSocial
    const User = app.exModular.models.User
    const Errors = app.exModular.services.errors

    let sessionSocial = null

    const auth = app.exModular.auth.getTokenFromReq(req)
    if (auth && auth.scheme === 'bearer') {
      // we have some token
      try {
        const payload = jwt.verify(auth.token, app.env.JWT_SECRET ? app.env.JWT_SECRET : DEF_SECRET, { clockTolerance: 3 })
        let aSession = {}
        Session.findById(payload.id)
          .then((session) => {
            if (!session) {
              // console.log('PAYLOAD:')
              // console.log(payload)
              return next(new Errors.ServerNotAllowed('session not registered'), null)
            }
            if (!session.createdAt || !session.userId) {
              return next(new Errors.ServerNotAllowed('session structure is invalid'), null)
            }
            aSession = session
            if (aSession.type === 'social') {
              return SessionSocial.findOne({ where: { sessionId: aSession.id } })
                .then((_sessionSocial) => {
                  if (!_sessionSocial) {
                    throw new Errors.ServerGenericError('socialSession is not found by sessionId!')
                  }
                  sessionSocial = _sessionSocial
                })
                .catch(e => { throw e })
            }
          })
          .then(() => User.findById(aSession.userId))
          .then((user) => {
            if (!user) {
              return next(new Errors.ServerNotAllowed('User not found'), null)
            }
            req.user = user
            req.user.session = aSession
            if (sessionSocial) {
              req.user.sessionSocial = sessionSocial
            }
            req.user.jwt = payload
            req.user.jwt.token = auth.token
            next()
          })
          .catch(e => next(e))
      } catch (e) {
        if (e instanceof jwt.JsonWebTokenError) {
          next(new Errors.ServerNotAllowed(e.toString()))
        } else {
          next(e)
        }
      }
    } else {
      // next(new Error('Auth failed, no auth header or unknown scheme'))
      req.user = app.exModular.access.ACCESS_GUEST
      req.user.session = null
      req.user.jwt = null
      next()
    }
  }

  return Module.module
}
