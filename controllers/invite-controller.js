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
  const Model = app.models.Invite

  return {
    list: (req, res) =>
      Model.findAll()
        .then((foundData) => res.json(foundData))
        .catch((error) => {
          if (error instanceof ServerError) {
            throw error
          } else {
            throw new ServerGenericError(error)
          }
        }),

    create: (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ServerInvalidParams(errors.mapped())
      }
      const data = matchedData(req)

      if (!data.expireAt ) {
        data.expireAt = Date.now() + 60000000
      }

      return Model.create(data)
        .catch((error) => {
          if (error instanceof ServerError) {
            throw error
          } else {
            throw new ServerGenericError(error)
          }
        })
    },

    item: (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ServerInvalidParams(errors.mapped())
      }
      const data = matchedData(req)

      return Model.findOne(data.id)
        .then((foundData) => {
          if (!foundData) {
            throw ServerNotFound('Invite', data.id, 'Invite not found')
          }
          res.json(foundData)
        })
        .catch((error) => {
          if (error instanceof ServerError) {
            throw error
          } else {
            throw new ServerGenericError(error)
          }
        })
    },

    save: (req, res) => {
    },

    delete: (req, res) => {
    }
  }
}
