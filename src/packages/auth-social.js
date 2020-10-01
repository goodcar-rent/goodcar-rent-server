// import * as ACCESS from './const-access'
import _ from 'lodash'
import { SessionType } from './const-session'

const packageName = 'auth-social'

export const AuthSocial = (app) => {
  const Module = {
    moduleName: packageName,
    dependency: [
      'services.errors',
      'services.errors.ServerError',
      'services.errors.ServerGenericError',
      'services.validator',
      'services.validator.checkBodyForModelName',
      'services.validator.paramId',
      'models',
      'models.User',
      'models.User.create',
      'models.User.count',
      'models.UserSocial',
      'models.UserDomain',
      'models.Session',
      'access.addAdmin',
      'routes.Add',
      'services.yandex'
    ],
    module: {}
  }

  app.exModular.modules.Add(Module)

  const Errors = app.exModular.services.errors
  const Yandex = app.exModular.services.yandex
  const Validator = app.exModular.services.validator
  const EmailParser = app.exModular.services.mailer.parser
  const Serial = app.exModular.services.serial

  const Session = app.exModular.models.Session
  const SessionSocial = app.exModular.models.SessionSocial
  const User = app.exModular.models.User
  const UserGroup = app.exModular.models.UserGroup
  const UserDomain = app.exModular.models.UserDomain
  const UserSocial = app.exModular.models.UserSocial

  const addSessionForUser = (user, ip, socialLogin) => {
    let session = { userId: user.id, ip }
    if (socialLogin) {
      session.type = SessionType.Social.value
    }
    return Session.createOrUpdate(session)
      .then((_session) => {
        session = _session
        return app.exModular.access.addLogged(user)
      })
      .then(() => {
        if (socialLogin) {
          return SessionSocial.createOrUpdate({
            sessionId: session.id,
            rawData: JSON.stringify(socialLogin),
            accessToken: socialLogin.accessToken
          })
        }
      })
      .then(() => {
        return {
          token: app.exModular.auth.encode(session.id),
          session: session
        }
      })
      .catch((error) => {
        // console.log('login: error')
        // console.log(error)
        if (error instanceof Errors.ServerError) {
          throw error
        } else {
          throw new Errors.ServerGenericError(error)
        }
      })
  }

  /**
   * Контроллер для входа пользователей через соцсети. Сейчас поддерживается только Яндекс
   * @param req
   * @param res
   * @param next
   * @return {Promise<function(...[*]=)>}
   */
  Module.module.loginSocial = (req, res, next) => {
    if (!req.data) {
      throw new Errors.ServerGenericError(
        `${packageName}.loginSocial: Invalid request handling: req.data not initialized, use middleware to parse body`)
    }

    if (!req.data.code) {
      throw new Errors.ServerGenericError(
        `${packageName}.loginSocial: code param is invalid`)
    }

    if (!req.params.provider) {
      throw new Errors.ServerInvalidParameters(
        'req.params.provider',
        '',
        `${packageName}.loginSocial: no req.params.provider`)
    }

    let user = null
    let socialLogin = null
    let socialProfile = null
    let rawProfile = null
    let domain = null
    let session = null

    return Yandex.authExchangeCodeForToken(req.data.code)
      .then((_socialLogin) => {
        socialLogin = _socialLogin

        // console.log('social login:')
        // console.log(socialLogin)

        return Yandex.authGetProfile(socialLogin.accessToken)
      })
      .then((_passport) => {
        // console.log('Yandex profile (from Passport API):')
        // console.log(_passport)
        if (!_passport || !_passport.default_email) {
          throw new Errors.ServerGenericError(
            `${packageName}.loginSocial: default_email not found in Yandex passport data`)
        }
        socialProfile = _passport
        rawProfile = _.assign({}, _passport)
        socialProfile.parsedEmail = EmailParser.parseOneAddress(socialProfile.default_email)
        return User.findOne({ where: { email: socialProfile.default_email } })
      })
      .then((aUser) => {
        user = aUser
        if (!user) {
          // throw new Errors.ServerInvalidUsernamePassword('User with this email not found')
          // user not found, so we need to check if users's domain is registered
          if (!socialProfile.parsedEmail.domain) {
            throw new Errors.ServerError('auth_social: invalid parsedEmail.domain')
          }

          return UserDomain.findOne({ where: { domain: socialProfile.parsedEmail.domain } })
            .then((_domain) => {
              if (!_domain || _domain.isAllow === false) {
                // domain not listed in list or listed as blocked, so break login
                throw new Errors.ServerInvalidUsernamePassword('User with this email not found in local database, or domain is not listed as allowed, or domain is blocked')
              }
              domain = _domain
              // we have isAllow === true domain, so we can add new user and link him to social profile
              return User.create({
                name: socialProfile.real_name,
                email: socialProfile.default_email
              })
            })
            .then((_user) => {
              user = _user
              return UserSocial.create({
                provider: 'yandex',
                userId: user.id,
                email: socialProfile.default_email,
                rawProfile: JSON.stringify(rawProfile)
              })
            })
            .then(() => {
              if (domain && domain.groups && domain.groups.length > 0) {
                return Serial(domain.groups.map((group) => () => UserGroup.usersAdd(group, user.id)))
              }
            })
            .then(() => addSessionForUser(user, req.ip, socialLogin))
            .then((_session) => {
              if (!_session) {
                throw new Errors.ServerGenericError('auth-social: Failed to create Session')
              }
              session = _session
              res.json({ token: session.token })
            })
            .catch((error) => {
              if (error instanceof Errors.ServerError) {
                throw error
              } else {
                throw new Errors.ServerGenericError(error)
              }
            })
        }

        if (user.disabled) {
          throw new Errors.ServerNotAllowed('User is disabled')
        }

        return addSessionForUser(user, req.ip, socialLogin)
          .then((data) => {
            res.json({ token: data.token })
          })
          .catch((error) => {
            if (error instanceof Errors.ServerError) {
              throw error
            } else {
              throw new Errors.ServerGenericError(error)
            }
          })
      })
  }

  // define routes for this module
  Module.module.routes = [
    {
      method: 'POST',
      name: 'Auth.Social',
      description: 'Login via social provider and return app token',
      path: '/auth/social/:provider',
      handler: Module.module.loginSocial,
      before: [
        app.exModular.auth.check,
        app.exModular.access.check('Auth.Social'),
        Validator.checkBodyForModel({
          name: 'AuthSocial',
          props: [
            {
              name: 'code',
              type: 'text',
              format: 'text',
              default: ''
            }
          ]
        }, { optionalId: true })
      ]
    }
  ]

  app.exModular.routes.Add(Module.module.routes)

  return app
}
