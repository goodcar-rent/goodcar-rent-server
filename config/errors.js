export class ServerError extends Error {
  constructor (message) {
    super(message)
  }
}

export class ServerInvalidParameters extends ServerError {
  constructor (paramName, paramType, message) {
    super(message)
    this.paramName = paramName
    this.paramType = paramType
  }
}

export class ServerInvalidParams extends ServerError {
  constructor(errors) {
    super('Validation of params failed')
    this.errors = errors
  }
}

export class ServerInvalidUsernamePassword extends ServerError {}

export class ServerNotAllowed extends ServerError {}

export class ServerGenericError extends ServerError {
  constructor(error) {
    super(error.message)
    this.error = error
  }
}

export class ServerNotFound extends ServerError {
  constructor(resource, id, message) {
    super(message)
    this.resource = resource
    this.id = id
  }
}
