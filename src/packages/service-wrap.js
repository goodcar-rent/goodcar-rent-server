import { isPromise } from './is-promise'

export const Wrap = (app) => (fn) => (req, res, next) => {
  const processErr = (next, err) => {
    if (app && app.server && app.server.error) {
      app.server.error('Error in wrapped async function:')
      app.server.error(err.toString())
    }
    next(err)
  }
  try {
    // console.log('wrap')
    if (fn.length === 2) {
      // console.log('wrap: fn-2')
      const p = fn(req, res)
      if (isPromise(p)) {
        // console.log('wrap: promise-2')
        p.catch((err) => {
          res.error = err
          processErr(next, err)
        })
      }
    } else if (fn.length === 3) {
      // console.log('wrap: fn-3')
      const p = fn(req, res, next)
      if (isPromise(p)) {
        // console.log('wrap: 3-promise')
        Promise.resolve(p)
          .then((res) => {
            // console.log('wrap: 3-next')
            if (isPromise(res)) {
              // console.log('!! is promise!')
            }
            next()
          })
          .catch((err) => {
            res.err = err
            processErr(next, err)
          })
      }
    }
  } catch (err) {
    res.err = err
    processErr(next, err)
  }
}
