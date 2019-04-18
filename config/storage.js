// import StorageKnexSqlite from '../storages/storage-Knex-sqlite'
import StorageSqlite from '../storages/storage-sqlite'

export default module.exports = (app) => {
  let storage = {}
  switch (app.env.APP_STORAGE) {
    case 'sqlite':
      storage = StorageSqlite(app)
      storage.storageLocation = 'server/db.sqlite'
      break
    case 'sqlite-memory':
      storage = StorageSqlite(app)
      storage.storageLocation = ':memory:'
      break
  }

  return storage
}
