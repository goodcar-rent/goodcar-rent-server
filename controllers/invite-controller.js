import { validationResult } from 'express-validator/check'
import { matchedData } from 'express-validator/filter'
import { ServerError, ServerGenericError, ServerInvalidParams, ServerNotFound } from '../config/errors'

export default module.exports = (app) => {
  const Model = app.models.Invite

  return {
    list: (req, res) => {
      return Model.findAll()
        .then((foundData) => res.json(foundData))
        .catch((error) => {
          if (error instanceof ServerError) {
            throw error
          } else {
            throw new ServerGenericError(error)
          }
        })
    },

    create: (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ServerInvalidParams(errors.mapped())
      }
      const data = matchedData(req)

      if (!data.expireAt) {
        data.expireAt = Date.now() + 60000000
      }

      return Model.create(data)
        .then((item) => res.json(item))
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

      return Model.findOne(req.params.id)
        .then((foundData) => {
          if (!foundData) {
            throw ServerNotFound('Invite', req.params.id, 'Invite not found')
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
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ServerInvalidParams(errors.mapped())
      }
      const data = matchedData(req)

      return Model.update(data)
        .then((foundData) => {
          return res.json(foundData)
        })
        .catch((error) => {
          if (error instanceof ServerError) {
            throw error
          } else {
            throw new ServerGenericError(error)
          }
        })
    },

    delete: (req, res) => {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        throw new ServerInvalidParams(errors.mapped())
      }

      return Model.delete(req.params.id)
        .then((foundData) => {
          if (foundData) {
            return res.sendStatus(204)
          }
          throw new ServerNotFound('Invite', req.params.id, 'Invite not found by id for delete')
        })
    }
  }
}
