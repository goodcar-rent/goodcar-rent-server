export const Wrap = (app) => (fn) => (req, res, next) => {
  const processErr = (next, err) => {
    if (app && app.server && app.server.error) {
      app.server.error('Error in wrapped async function:')
      app.server.error(err.toString())
    }
    next(err)
  }
  try {
    fn(req, res)
      .then(() => next())
      .catch((err) => { processErr(next, err) })
  } catch (err) { processErr(next, err) }
}
