const processErr = (next, err) => {
  if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
    console.log('controller error:')
    console.log(err)
  }
  next(err)
}

export default (fn) => (req, res, next) => {
  try {
    fn(req, res)
      .then(() => next())
      .catch((err) => { processErr(next, err) })
  } catch (err) {
    processErr(next, err)
  }
}
