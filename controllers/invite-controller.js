import { ServerError, ServerGenericError, ServerNotFound } from '../config/errors'

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
      if (!req.matchedData.expireAt) {
        req.matchedData.expireAt = Date.now() + 60000000
      }

      return Model.create(req.matchedData)
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
      return Model.update(req.matchedData)
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
      return Model.delete(req.params.id)
        .then((foundData) => {
          if (foundData) {
            return res.sendStatus(204)
          }
          throw new ServerNotFound('Invite', req.params.id, 'Invite not found by id for delete')
        })
    },

    send: (req, res) => {
      return Model.findById(req.params.id)
        .then((foundData) => {
          if (!foundData) {
            throw ServerNotFound('Invite', req.params.id, 'Invite not found')
          }
          const msg = `# Invite for GoodCar.rent site registration\n\r
            \n\r
            Please use this link to [register](${app.serverAddress}/auth/signup?invite=${foundData.id})`
          return app.mail(foundData.email, 'Invite for GoodCar.rent', msg)
        })
        .then(() => res.sendStatus(200))
        .catch((error) => {
          if (error instanceof ServerError) {
            throw error
          } else {
            throw new ServerGenericError(error)
          }
        })
    }
  }
}
