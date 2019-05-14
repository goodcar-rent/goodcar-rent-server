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
  const { User, Invite, UserGroup, Login } = app.models
  return {
    login: (req, res) => {
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

          if (user.disabled) {
            return Promise.reject(new ServerNotAllowed('User is disabled'))
          }

          // if (!user.emailVerified) {
          //  throw new ServerNotAllowed('Email should be verified')
          // }

          if (!User.isPassword(user.password, data.password)) {
            throw new ServerInvalidUsernamePassword('Invalid username or password') // password error
          }

          return Login.createOrUpdate({ userId: user.id, ip: req.ip })
        })
        .then((login) => {
          res.json({ token: jwt.encode({ id: login.id }, app.env.JWT_SECRET) })
          return UserGroup.addUser(UserGroup.systemGroupLoggedIn(), login.userId)
        })
        .catch((error) => {
          // console.log('login: error')
          // console.log(error)
          if (error instanceof ServerError) {
            throw error
          } else {
            throw new ServerGenericError(error)
          }
        })
    },

    logout: (req, res) => {
      // console.log('Auth.Logout')
      if (!req || !req.user || !req.user.loginId) {
        return Promise.reject(new ServerNotAllowed('User session not found'))
      }

      // console.log(`finding login id=${req.user.loginId}`)
      return Login.findById(req.user.loginId)
        .then((login) => {
          // console.log(`Login found: ${login}`)
          if (!login) {
            return Promise.reject(new ServerNotAllowed('Login not found'))
          }

          // destroy current session
          // remove current user from logged-in group
          return Promise.all([
            Login.removeById(login.id),
            UserGroup.removeUser(UserGroup.systemGroupLoggedIn(), login.userId)
          ])
        })
        .then((data) => {
          req.logOut()
          res.status(200).send()
          return Promise.resolve()
        })
        .catch((error) => {
          // console.log('login: error')
          // console.log(error)
          if (error instanceof ServerError) {
            throw error
          } else {
            throw new ServerGenericError(error)
          }
        })
    },

    signup: (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ServerInvalidParams(errors.mapped())
      }
      const data = matchedData(req)

      const isAdmin = data.isAdmin || false
      // if (data[isAdmin] !== undefined) {
      // console.log('\nremoving data.isAdmin field\n')
      delete data.isAdmin
      // }

      // flow for registration of first user:
      if (!data.invite) {
        return User.count()
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

            // console.log('create user:')
            // console.log(data)
            return User.create(data)
          })
          .then((newUser) => {
            // console.log('newUser:')
            // console.log(newUser)
            const ctype = req.accepts(['html', 'json'])
            console.log('CType:')
            console.log(ctype)
            if (ctype === 'json') {
              res.json(newUser)
            } else if (ctype === 'html') {
              const params = {}
              params.user = {
                name: newUser.name,
                email: newUser.email
              }
              res.render('auth/signup-completed', params)
            }
            const _adminGroup = UserGroup.systemGroupAdmin()
            return UserGroup.addUser(_adminGroup, newUser.id)
          })
          .then(() => UserGroup.findAll())
          .catch((error) => {
            console.log('signup: error')
            console.log(error)
            if (error instanceof ServerError) {
              throw error
            } else {
              throw new ServerGenericError(error)
            }
          })
      }

      const aData = {} // data bag for promise chain to simplify data transfer

      // flow for generic registration via invite
      let assignUserGroups = []
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

          if (foundInvite.email !== data.email) {
            throw new ServerNotAllowed(`Email not matched with invite's email`)
          }

          delete data.invite
          data.invitedBy = foundInvite.invitedBy
          data.inviteDate = foundInvite.date
          data.inviteId = foundInvite.id

          aData.invite = foundInvite

          assignUserGroups = foundInvite.assignUserGroups

          // console.log(`\npreparing to create user: ${JSON.stringify(data)}`)
          return User.create(data)
        })
        .then((createdUser) => {
          const ctype = req.accepts(['html', 'json'])
          console.log('CType:')
          console.log(ctype)
          if (ctype === 'json') {
            res.json(createdUser)
          } else if (ctype === 'html') {
            const params = {}
            params.user = {
              name: createdUser.name,
              email: createdUser.email
            }
            res.render('auth/signup-completed', params)
          }
          aData.invite.registeredUser = createdUser.id
          return Invite.update(aData.invite)
        })
        .then((updatedInvite) => {
          // console.log('signup: updatedInvite:')
          // console.log(updatedInvite)
          // console.log('assignUserGroups:')
          // console.log(assignUserGroups)

          if (assignUserGroups && assignUserGroups.length > 0) {
            return UserGroup.addUserGroupsForUser(updatedInvite.registeredUser, assignUserGroups)
          }
        })
        .catch((error) => {
          console.log('signup: error')
          console.log(error)
          if (error instanceof ServerError) {
            throw error
          } else {
            throw new ServerGenericError(error)
          }
        })
    },

    signupPage: (req, res) => {
      const params = {}
      if (req.query.invite) {
        params.invite = req.query.invite
      }
      res.render('auth/signup', params)
      return Promise.resolve()
    }
  }
}
