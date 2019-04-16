import sqlite from 'sqlite'

/* Storage service:
  Mount point - app.storage
  Mounted APIs:
  - storage.modelPath
  - storage.initStorage
*/
export default module.exports = (app) => {
  let ModelPath = '../services/model-storage-memory'

  if (!app.storage) {
    app.storage = {}
  }

  switch (app.env.APP_STORAGE) {
    case 'memory':
      ModelPath = '../services/model-storage-memory'
      app.storage.initStorage = (app) => Promise.resolve(true)
      break
    case 'sqlite':
      ModelPath = '../services/model-storage-sqlite'
      app.storage.initStorage = (app) => {
        return Promise.resolve()
          .then(() => sqlite.open('server/db.sqlite', { Promise }))
          .then((db) => {
            app.storage.db = db
            return app
          })
          .catch((err) => { throw err })
      }
      break
    case 'sqlite-memory':
      ModelPath = '../services/model-storage-sqlite'
      app.storage.initStorage = (app) => {
        return Promise.resolve()
          .then(() => sqlite.open(':memory:', { Promise }))
          .then((db) => {
            app.storage.db = db
            return app
          })
          .catch((err) => { throw err })
      }
      break
  }

  app.storage.modelPath = ModelPath
  return app
}
