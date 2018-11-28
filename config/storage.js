import sqlite from 'sqlite'

export default module.exports = (app) => {
  let ModelPath = '../services/model-storage-memory'

  if (!app.storage) {
    app.storage = {}
  }

  if (app.env.APP_STORAGE === 'memory') {
    ModelPath = '../services/model-storage-memory'
    app.storage.initStorage = (app) => Promise.resolve(true)
  } else if (app.env.APP_STORAGE === 'sqlite') {
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
  } else if (app.env.APP_STORAGE === 'sqlite-memory') {
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
  }
  app.storage.modelPath = ModelPath

  return app
}
