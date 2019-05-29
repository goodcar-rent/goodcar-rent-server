import { ServerError, ServerGenericError, ServerNotAllowed } from '../config/errors'

export default module.exports = (app) => {

  return {
    seedUserGroups: (req, res) => {
      const Model = app.models.UserGroup

      if (!req.users) {
        throw new ServerNotAllowed('User is not authenticated')
      }
      return Model.createSystemData()
        .then(() => res.status(204).send())
        .catch((error) => {
          if (error instanceof ServerError) {
            throw error
          } else {
            throw new ServerGenericError(error)
          }
        })
    },

    clearData: (req, res) => {
      if (!req.users) {
        throw new ServerNotAllowed('User is not authenticated')
      }

      return app.models.clearData()
        .then(() => res.status(204).send())
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
