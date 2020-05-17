import { body, param, validationResult, matchedData, query, oneOf } from 'express-validator'
import validator from 'validator'

const packageName = 'Service.Validator'

export const Validator = (app) => {
  app.exModular.modules.Add({ moduleName: packageName, dependency: ['services.errors', 'services.errors.ServerInvalidParams'] })

  const saveValidatedData = (req, res, next) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        next(new app.exModular.services.errors.ServerInvalidParams({ errors: errors.array() }))
      }
      req.data = matchedData(req, { includeOptionals: true })
      next()
    } catch (e) {
      next(e)
    }
  }

  const mapPropToValidation = (Model, prop, propName, options) => {
    if (prop.type === 'text') {
      let v = body(propName).isString().withMessage(`${Model.name}.${prop.name} should be string`)
      if (prop.default !== undefined) {
        v = v.optional({ nullable: true })
      }
      return v
    } else if (prop.type === 'decimal') {
      let v = body(propName).isDecimal({ decimal_digits: `0,${prop.scale}` }).withMessage(`${Model.name}.${prop.name} should be decimal number with no more then ${prop.scale} digital digits`)
      if (prop.default !== undefined) {
        v = v.optional({ nullable: true })
      }
      return v
    } else if (prop.type === 'id') {
      let v = body(propName).isString().withMessage(`${Model.name}.${prop.name} should be string UUID`)
      if (options && options.optionalId) {
        v = v.optional()
      }
      return v
    } else if (prop.type === 'refs') {
      let v = body(propName).isArray({ min: 0 }).withMessage('Users should be specified as array')
      if (prop.default !== undefined) {
        v = v.optional()
      }
      return v
    } else if (prop.type === 'ref') {
      return body(propName).optional().isString().withMessage(`${Model.name}.${prop.name} should be string UUID`)
    } else if (prop.type === 'boolean') {
      let v = body(propName).isBoolean().withMessage(`${Model.name}.${prop.name} should be boolean`)
      if (prop.default !== undefined) {
        v = v.optional({ nullable: true })
      }
      return v
    } else if (prop.type === 'enum') {
      const aValues = prop.format.map((item) => item.value)
      return body(propName).isIn(aValues).withMessage(`${Model.name}.${prop.name} should have predefined enum values: ${aValues}`)
    }
    return null
  }

  const checkBodyForModel = (Model, options) => {
    // build validations for single object:
    const validations = []
    // const v = []
    Model.props.map((prop) => {
      const v2 = mapPropToValidation(Model, prop, prop.name, options)
      if (v2) {
        validations.push(v2)
      }
    })

    // // build validations for array of objects:
    // if (options && options.orArray) {
    //   v.push(body().isArray().withMessage('Should be array'))
    //   Model.props.map((prop) => {
    //     const v2 = mapPropToValidation(Model, prop, ['*.' + prop.name], options)
    //     if (v2) {
    //       v.push(v2)
    //     }
    //   })
    //   return [oneOf([validations, v]), saveValidatedData]
    // } else {
    return [validations, saveValidatedData]
    // }
  }

  const checkBodyForModelName = (modelName, options) => {
    const model = app.exModular.models[modelName]
    return checkBodyForModel(model, options)
  }

  const listFilterValidator = (Model, options) => {
    // const validations = []
    return query(['filter']).optional()
  }

  const checkBodyForArrayOfModel = (Model, options) => {
    const prepareDate = (req, res, next) => {
      if (!Array.isArray(req.body)) {
        req.body = [req.body]
      }
      req.body._items = []
      req.body.map((item, ndx) => {
        req.body._items[ndx] = item
      })
      next()
    }

    const validations = []
    // const v = []
    Model.props.map((prop) => {
      const v2 = mapPropToValidation(Model, prop, `_items.*.${prop.name}`, options)
      if (v2) {
        validations.push(v2)
      }
    })
    return [prepareDate, validations, saveValidatedData]
  }

  const checkBodyForArrayOfRefs = (Model, prop) => {
    return [
      (req, res, next) => {
        if (!Array.isArray(req.body)) {
          req.body = [req.body]
        }
        req.body.map((item) => {
          if (!validator.isUUID(item)) {
            const err = new app.exModular.services.errors.ServerInvalidParameters(
              `${Model.name}.${prop.name}`,
              'refs',
              'not UUID'
            )
            next(err)
          }
        })
        req.data = req.body
        next()
      }
    ]
  }

  const applyValidationsToReq = (validations, req) => {
    return Promise.all(validations.map((validation) => validation.run(req)))
      .then(() => {
        req.validationErrors = validationResult(req)
        if (!req.validationErrors.isEmpty()) {
          // TODO: add logging error
          throw new app.services.errors.ServerInvalidParams(req.validationErrors.mapped())
        }
        req.matchedData = matchedData(req)
        return req
      })
      .catch((err) => { throw err })
  }
  const paramId = (Model) => {
    return param('id').isString().withMessage('Id should be specified in URL')
  }

  return {
    checkBodyForModel,
    checkBodyForModelName,
    checkBodyForArrayOfModel,
    checkBodyForArrayOfRefs,
    saveValidatedData,
    applyValidationsToReq,
    paramId,
    listFilterValidator
  }
}
