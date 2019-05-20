// import StorageKnexSqlite from '../storages/storage-Knex-sqlite'
import StorageSqlite from '../storages/storage-sqlite'
import KnexSqlite from '../storages/storage-knex-sqlite'
import KnexMysql from '../storages/storage-knex-mysql'

export default module.exports = (app) => {
  let storage = {}
  console.log(`\nStorage engine : ${app.env.APP_STORAGE}\n`)
  switch (app.env.APP_STORAGE) {
    // case 'sqlite':
    //   storage = StorageSqlite(app)
    //   storage.storageLocation = 'server/db.sqlite'
    //   break
    // case 'sqlite-memory':
    //   storage = StorageSqlite(app)
    //   storage.storageLocation = ':memory:'
    //   break
    case 'knex-sqlite':
      storage = KnexSqlite(app)
      storage.storageLocation = 'server/db.sqlite'
      break
    case 'knex-mysql':
      storage = KnexMysql(app)
      storage.storageLocation = app.env.APP_DB_PATH
      break
  }

  return storage
}
