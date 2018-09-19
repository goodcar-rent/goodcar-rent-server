import { validationResult } from 'express-validator/check'
import { matchedData } from 'express-validator/filter'
import jwt from 'jwt-simple'
import {
  ServerError,
  ServerGenericError,
  ServerInvalidParams,
  ServerInvalidUsernamePassword,
  ServerNotAllowed, ServerNotFound
} from '../config/errors'

export default module.exports = (app) => {
  const { User, Invite } = app.models
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
          // if (!user.emailVerified) {
          //  throw new ServerNotAllowed('Email should be verified')
          // }

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

    signupPost: (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ServerInvalidParams(errors.mapped())
      }
      const data = matchedData(req)

      const isAdmin = data.isAdmin || false
      if (data.isAdmin) {
        delete data.isAdmin
      }

      // flow for registration of first user:
      const firstUserReg = User.count()
        .then((userCount) => {
          if (app.env.APP_INVITE_ONLY === 'true' && userCount !== 0 && !data.invite) {
            throw new ServerNotAllowed('Invite-only sign up')
          }
          if (!isAdmin) {
            throw new ServerNotAllowed('First user should be admin')
          }
          data.invitedBy = null
          data.inviteDate = null
          data.inviteId = null

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

      // flow for invite registration
      if (!data.invite) {
        return firstUserReg
      }
      const aData = {} // data bag for promise chain to simplify data transfer

      return Invite.findById(data.invite)
        .then((foundInvite) => {
          if (!foundInvite) {
            throw new ServerNotFound('Invite', data.invite, 'This invite not found at all! Please ask for another invite')
          }

          if (foundInvite.expireAt < Date.now()) {
            throw new ServerNotAllowed('Invite expired')
          }

          if (foundInvite.disabled) {
            throw new ServerNotAllowed('Invite disabled')
          }

          if (foundInvite.registeredUser) {
            throw new ServerNotAllowed(`Invite already used by user ${foundInvite.registeredUser}`)
          }

          data.invitedBy = foundInvite.invitedBy
          data.inviteDate = foundInvite.date
          data.inviteId = foundInvite.id

          aData.invite = foundInvite
          return User.create(data)
        })
        .then((createdUser) => Invite.updateOne(aData.invite, { registeredUser: createdUser.id }))
    },

    loginGet: (req, res) => {
      const params = {}
      if (req.query.invite) {
        params.invite = req.query.invite
      }
      res.render('auth/login', params)
    }
  }
}
