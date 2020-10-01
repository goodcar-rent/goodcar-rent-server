export const Errors = (app) => {
  const errors = {}

  errors.ServerError = class ServerError extends Error {
  }

  errors.ServerInvalidParameters = class ServerInvalidParameters extends errors.ServerError {
    constructor (paramName, paramType, message) {
      super(message)
      this.paramName = paramName
      this.paramType = paramType
    }
  }

  errors.ServerInvalidParams = class ServerInvalidParams extends errors.ServerError {
    constructor (errors) {
      super('Validation of params failed')
      this.errors = errors
    }
  }

  errors.ServerInvalidUsernamePassword = class ServerInvalidUsernamePassword extends errors.ServerError {}
  errors.ServerNotAllowed = class ServerNotAllowed extends errors.ServerError {}

  errors.ServerGenericError = class ServerGenericError extends errors.ServerError {
    constructor (error) {
      super(error.message)
      this.error = error
    }
  }

  errors.ServerNotFound = class ServerNotFound extends errors.ServerError {
    constructor (resource, id, message) {
      super(message)
      this.resource = resource
      this.id = id
    }
  }

  errors.handler = (err, req, res, next) => {
    // providing error in development / testing
    // const payload = {}
    // payload.error = (req.app.get('env') === 'development' ? err : (req.app.get('env') === 'test' ? err : {}))

    if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
      console.log('ERROR handler:')
      console.log(err.toString())
    }

    if (err instanceof errors.ServerError) {
      if (err instanceof errors.ServerInvalidParameters) {
        res.status(412).json({ message: err.message, err })
      } else if (err instanceof errors.ServerInvalidParams) {
        res.status(412).json({ message: err.message, error: err.errors })
      } else if (err instanceof errors.ServerInvalidUsernamePassword) {
        res.status(401).json({ message: err.message, err })
      } else if (err instanceof errors.ServerNotAllowed) {
        res.status(403).json({ message: err.message, err })
      } else if (err instanceof errors.ServerNotFound) {
        res.status(404).json({
          message: err.message,
          resource: err.resource,
          id: err.id,
          err
        })
      } else if (err instanceof errors.ServerGenericError) {
        res.status(503).json({ message: 'Generic error', err })
      } else {
        res.status(500).json({ message: 'Other server error', err })
      }
    } else {
      res.status(500).json({ message: 'Error', err })
    }
  }

  return errors
}
