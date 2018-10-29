import { validationResult } from 'express-validator/check'
import { ServerInvalidParams } from '../config/errors'
import { matchedData } from 'express-validator/filter'

export default function (req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
        console.log('param-check: validation error')
        console.log(errors.mapped())
      }
      next(new ServerInvalidParams(errors.mapped()))
    }
    req.matchedData = matchedData(req)
    next()
  } catch (err) {
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      console.log('param-check: error')
      console.log(err)
    }
    next(err)
  }
}
