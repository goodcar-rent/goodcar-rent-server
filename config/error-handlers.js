import {
  ServerError, ServerGenericError,
  ServerInvalidParameters,
  ServerInvalidParams,
  ServerInvalidUsernamePassword,
  ServerNotAllowed, ServerNotFound
} from './errors'

export default module.exports = (app) => {
  app.use((error, req, res, next) => {
    // default error handlers for DokkaBot (rich error messages):
    if (error instanceof ServerError) {
      if (error instanceof ServerInvalidParameters) {
        res.status(412).json({ message: error.message, error })
      } else if (error instanceof ServerInvalidParams) {
        res.status(412).json({ message: error.message, error: error.errors })
      } else if (error instanceof ServerInvalidUsernamePassword) {
        res.status(401).json({ message: error.message, error })
      } else if (error instanceof ServerNotAllowed) {
        res.status(403).json({ message: error.message, error })
      } else if (error instanceof ServerNotFound) {
        res.status(404).json({
          message: error.message,
          resource: error.resource,
          id: error.id,
          error
        })
      } else if (error instanceof ServerGenericError) {
        res.status(503).json({ message: 'Generic error', error })
      } else {
        res.status(500).json({ message: 'Other server error', error })
      }
    } else {
      res.status(500).json({ message: 'Error', error })
    }
    next(error)
  })
}
