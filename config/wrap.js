export default (fn) => (req, res, next) => {
  try {
    fn(req, res)
      .then(() => next())
      .catch((err) => { next(err) })
  } catch (err) {
    next(err)
  }
}