import { ServerError, ServerGenericError, ServerNotAllowed, ServerNotFound } from '../config/errors'

export default module.exports = (app) => {
  const Model = app.models.User

  return {
    me: (req, res) => {
      if (!req.users) {
        throw new ServerNotAllowed('User is not authenticated')
      }
      return Model.findById(req.users.id)
        .then((foundData) => {
          if (!foundData) {
            throw new ServerNotFound(Model.name, req.users.id, `${Model.name} with id ${req.params.id} not found`)
          }
          res.json(foundData)
          return foundData
        })
        .catch((error) => {
          if (error instanceof ServerError) {
            throw error
          } else {
            throw new ServerGenericError(error)
          }
        })
    },
    permissions: (req, res) =>
      app.auth.ListACLForUser(req.users.id)
        .then((resp) => {
          res.json(resp)
          return Promise.resolve(resp)
        })
        .catch((err) => Promise.reject(err))
  }
}
