import { ServerError, ServerGenericError, ServerNotAllowed } from '../config/errors'

export default module.exports = (app) => {
  const Model = app.models.UserGroup

  return {
    seedUserGroups: (req, res) => {
      if (!req.user) {
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
    }
  }
}
