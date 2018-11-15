import sqlite from 'sqlite'

export default module.exports = (app) => {
  return Promise.resolve()
    .then(() => {
      if (app.env.APP_STORADE === 'sqlite') {
        return sqlite.open('../server/db.sqlite', { Promise })
          .then((db) => {
            app.db = db
            return app
          })
      }
      return app
    })
    .catch((err) => { throw err })
}
