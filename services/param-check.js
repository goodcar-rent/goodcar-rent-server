import { validationResult } from 'express-validator/check'
import { ServerInvalidParams } from '../config/errors'
import { matchedData } from 'express-validator/filter'

export default function (req, res, next) {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log(errors.mapped())
      next(new ServerInvalidParams(errors.mapped()))
    }
    req.matchedData = matchedData(req)
    next()
  } catch (err) {
    next(err)
  }
}
