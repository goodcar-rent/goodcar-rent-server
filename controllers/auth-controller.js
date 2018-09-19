import { validationResult } from 'express-validator/check'
import { matchedData } from 'express-validator/filter'
import jwt from 'jwt-simple'
import {
  ServerError,
  ServerGenericError,
  ServerInvalidParams,
  ServerInvalidUsernamePassword,
  ServerNotAllowed
} from '../config/errors'

export default module.exports = (app) => {
  const { User } = app.models
  return {
    loginPost: (req, res) => {
      // validate all req params (defined in router):
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ServerInvalidParams(errors.mapped())
      }
      const data = matchedData(req)

      return User.findOne({ where: { email: data.email } })
        .then((user) => {
          if (!user) {
            return Promise.reject(new ServerInvalidUsernamePassword('Invalid username or password'))
          }
          //if (!user.emailVerified) {
          //  throw new ServerNotAllowed('Email should be verified')
          //}

          if (!User.isPassword(user.password, data.password)) {
            throw new ServerInvalidUsernamePassword('Invalid username or password') // password error
          }
          return res.json({ token: jwt.encode(user.id, app.env.JWT_SECRET) })
        })
        .catch((error) => {
          if (error instanceof ServerError) {
            throw error
          } else {
            throw new ServerGenericError(error)
          }
        })
    },

    signupPost: (req,res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new DokkaInvalidParams(errors.mapped())
      }
      const data = matchedData(req)

      const isAdmin = data.isAdmin || false
      if (data.isAdmin) {
        delete data.isAdmin
      }

      return User.count()
        .then((userCount) => {
          if (app.env.APP_INVITE_ONLY === 'true' && userCount !== 0) {
            throw new ServerNotAllowed('Invite-only sign up')
          }
          if (!isAdmin) {
            throw new ServerNotAllowed('First user should be admin')
          }
          return User.create(data)
        })
        .then((newUser) => {
          res.json(newUser)
        })
        .catch((error) => {
          console.log(error)
          if (error instanceof ServerError) {
            throw error
          } else {
            throw new ServerGenericError(error)
          }
        })
    }
  }
}